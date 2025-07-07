import { Model } from 'mongoose';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Transaction } from 'src/interfaces/transaction.interface';
import { CreateTransactionDto } from 'src/dto/create-transaction.dto';
import { PipelineStage } from 'mongoose';
import { User } from '../interfaces/user.interface';
import UpdateTransactionDto from 'src/dto/update-transaction.dto';
import * as PDFDocument from 'pdfkit';
const SLR = require('ml-regression').SLR;
import * as moment from 'moment';
import { Response } from 'express';
const EXPENDITURE_CATEGORIES_MAP = {
  transport: 'Transport',
  food: 'Food & Drinks',
  groceries: 'Groceries',
  rent: 'Rent',
  loans: 'Loan',
  entertainment: 'Entertainment',
  clothes: 'Clothes',
  internet: 'Internet & Phone',
  na: 'Miscellaneous',
  transfer: 'Fund Transfer',
  gadget: 'Gadget',
  car: 'Car Fuel & Maintainance',
  income: 'Income or Budget',
  mutualFund: 'Mutual Fund',
  fd: 'Fixed Deposit',
  rd: 'Recurring Deposit',
  stocks: 'Stocks',
  health: 'Health & Grooming',
  creditcard: 'Credit Card Bill',
};

@Injectable()
export class TransactionService {
  constructor(
    @Inject('TRANSACTION_MODEL')
    private transactionModel: Model<Transaction>,
  ) {}
  private inProgress = new Set();
  async create(
    createTransactionDto: CreateTransactionDto,
    user: User,
  ): Promise<Transaction> {
    const userId = (user._id || '').toString();
    createTransactionDto.userId = userId;
    const createExpense = new this.transactionModel(createTransactionDto);
    return createExpense.save();
  }

  async getExpenditures(
    user: any,
    month: string,
    year: string,
    groupBy: string,
  ): Promise<any> {
    const userId = (user._id || '').toString();
    if (!userId) {
      throw new UnauthorizedException();
    }
    const matchQuery = {
      userId: userId,
      type: 'DEBIT',
    };
    if (groupBy === 'day') {
      matchQuery['month'] = month;
    }
    const pipeline1: PipelineStage[] = [
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: {
            date: `$${groupBy}`,
            category: '$category',
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $group: {
          _id: '$_id.date',
          categories: {
            $push: {
              k: '$_id.category',
              v: '$totalAmount',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          categories: { $arrayToObject: '$categories' },
        },
      },
      {
        $addFields: {
          transport: { $ifNull: ['$categories.transport', 0] },
          food: { $ifNull: ['$categories.food', 0] },
          rent: { $ifNull: ['$categories.rent', 0] },
          groceries: { $ifNull: ['$categories.groceries', 0] },
          loans: { $ifNull: ['$categories.loans', 0] },
          entertainment: { $ifNull: ['$categories.entertainment', 0] },
          household: { $ifNull: ['$categories.household', 0] },
          creditcard: { $ifNull: ['$categories.creditcard', 0] },
          clothes: { $ifNull: ['$categories.clothes', 0] },
          internet: { $ifNull: ['$categories.internet', 0] },
          na: { $ifNull: ['$categories.na', 0] },
          transfer: { $ifNull: ['$categories.transfer', 0] },
          gadget: { $ifNull: ['$categories.gadget', 0] },
          car: { $ifNull: ['$categories.car', 0] },
          health: { $ifNull: ['$categories.health', 0] },
        },
      },
      {
        $project: {
          categories: 0,
        },
      },
    ];
    const expenses: any = await this.transactionModel.aggregate(pipeline1);
    if (expenses && expenses.length) {
      expenses.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
      expenses.forEach((expense: any) => {
        expense['totalExpenditure'] = 0;
        for (const key in expense) {
          if (!['totalExpenditure', 'date'].includes(key)) {
            expense['totalExpenditure'] =
              expense['totalExpenditure'] + expense[key];
          }
          if (expense[key] === 0) {
            delete expense[key];
          }
        }
      });
    }
    return expenses;
  }

  async getTotalExpenditureAndIncome(
    user: any,
    month: string,
    year: string,
    type: string,
  ): Promise<any> {
    const userId = (user._id || '').toString();
    if (!userId) {
      throw new UnauthorizedException();
    }
    const matchQuery = {
      userId: userId,
    };
    if (month) {
      matchQuery['month'] = month;
    } else if (year) {
      matchQuery['year'] = year;
    }
    const totalPipelineQuery: PipelineStage[] = [
      {
        $match: matchQuery,
      },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          totalAmount: 1,
        },
      },
    ];
    const results: any[] =
      await this.transactionModel.aggregate(totalPipelineQuery);

    const response = {
      totalExpenses: 0,
      totalIncome: 0,
      totalSavings: 0,
    };
    if (results && results.length) {
      results.forEach((result) => {
        if (result['type'] === 'SAVINGS' || result['type'] === 'SAVING') {
          response.totalSavings = result['totalAmount'];
        }
        if (result['type'] === 'DEBIT') {
          response.totalExpenses = result['totalAmount'];
        }
        if (result['type'] === 'CREDIT') {
          response.totalIncome = result['totalAmount'];
        }
      });
    }
    return response;
  }

  async getTransactionsList(
    user: any,
    month: string,
    year: string,
    type: string,
    limit: number,
    offset: number,
    category: string,
  ): Promise<any> {
    const userId = (user._id || '').toString();
    if (!userId) {
      throw new UnauthorizedException();
    }
    offset = offset || 0;
    limit = limit || 100;
    const query = {
      userId: userId,
      month: month,
    };
    if (category) {
      query['category'] = category;
    }
    //this.transactionsDataCorrection();
    const transactionsCount = await this.transactionModel.countDocuments(query);
    const transactions: any[] = await this.transactionModel
      .find(query)
      .sort({ day: -1 })
      .skip(offset)
      .limit(limit);
    return { transactions: transactions, totalCount: transactionsCount };
  }

  async transactionsDataCorrection() {
    const transactions: any[] = await this.transactionModel.find();
    for (const transaction of transactions) {
      await this.transactionModel.findByIdAndUpdate(transaction._id, {
        $set: { currencyCode: 'INR' },
      });
    }
  }

  async deleteExpenditure(user: any, _id: string) {
    if (_id) {
      await this.transactionModel.findByIdAndDelete(_id);
    }
    return true;
  }

  async updateTransaction(
    id: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const updatedTransaction = await this.transactionModel.findByIdAndUpdate(
      id,
      { $set: updateTransactionDto },
      { new: true }, // return the updated document
    );
    return updatedTransaction;
  }

  async getInsights(user: any, month) {
    const userId = (user._id || '').toString();
    const currencyCode = user.currencyCode || 'INR';
    if (!userId) {
      throw new UnauthorizedException();
    }
    if (this.inProgress.has(userId)) {
      return 'Already Processing';
    }
    this.inProgress.add(userId);
    try {
      const topCategories: any[] = await this.getTopExpenditureCategories(
        userId,
        month,
      );
      const monthlyChange: string = await this.getMonthlyChange(userId, month);
      const peerComparision: string = await this.peerComparision(
        userId,
        currencyCode,
        month,
      );
      const nextMonthPrediction = await this.predictNextMonthSpend(userId);
      const insightsObject = {
        topCategories: topCategories,
        monthlyChange: monthlyChange,
        averageSpendVsOthers: peerComparision,
        predictedEndOfMonthSpend: nextMonthPrediction,
        //warnings: ['High spending on Electronics this week'],
      };
      return insightsObject;
    } finally {
      this.inProgress.delete(userId);
    }
  }

  async getTopExpenditureCategories(userId, month): Promise<any[]> {
    const topCategories: any[] = await this.transactionModel.aggregate([
      {
        $match: {
          userId: userId,
          month: month,
          type: 'DEBIT',
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpend: { $sum: '$amount' },
        },
      },
      {
        $sort: { totalSpend: -1 },
      },
      {
        $limit: 3,
      },
    ]);
    if (topCategories && topCategories.length) {
      const categories = topCategories.map(
        (category) => EXPENDITURE_CATEGORIES_MAP[category._id],
      );
      return categories;
    }
    return [];
  }
  async getMonthlyChange(userId, month): Promise<string> {
    const current = moment(month, 'YYYY-MM');
    const previous = current.subtract(1, 'month').format('YYYY-MM');
    const totalExpenditureInCurrentAndLastMonth =
      await this.transactionModel.aggregate([
        {
          $match: {
            userId: userId,
            type: 'DEBIT',
            month: { $in: [month, previous] }, // current & last month
          },
        },
        {
          $group: {
            _id: '$month',
            totalSpend: { $sum: '$amount' },
          },
        },
        {
          $project: {
            month: '$_id',
            totalSpend: 1,
            _id: 0,
          },
        },
      ]);
    if (
      totalExpenditureInCurrentAndLastMonth &&
      totalExpenditureInCurrentAndLastMonth.length
    ) {
      const last =
        totalExpenditureInCurrentAndLastMonth.find((d) => d.month === previous)
          ?.totalSpend || 0;
      const current =
        totalExpenditureInCurrentAndLastMonth.find((d) => d.month === month)
          ?.totalSpend || 0;
      const percentageChange =
        last > 0 ? (((current - last) / last) * 100).toFixed(0) + '%' : 'N/A';
      return percentageChange;
    }
    return 'N/A';
  }

  async peerComparision(userId, currencyCode, month): Promise<string> {
    const userVsOthersResults: any = await this.transactionModel.aggregate([
      {
        $match: {
          month: month,
          type: 'DEBIT',
          isValid: true,
        },
      },
      {
        $facet: {
          userSpend: [
            { $match: { userId: userId } },
            {
              $group: {
                _id: null,
                total: { $sum: '$amount' },
              },
            },
          ],
          othersAverage: [
            { $match: { userId: { $ne: userId }, currencyCode: currencyCode } },
            {
              $group: {
                _id: '$userId',
                total: { $sum: '$amount' },
              },
            },
            {
              $group: {
                _id: null,
                avgSpend: { $avg: '$total' },
              },
            },
          ],
        },
      },
    ]);
    if (userVsOthersResults) {
      const user = userVsOthersResults[0].userSpend[0]?.total || 0;
      const avg = userVsOthersResults[0].othersAverage[0]?.avgSpend || 0;
      const comparison =
        avg > 0 ? (((user - avg) / avg) * 100).toFixed(0) + '%' : 'N/A';
      return comparison;
    }
    return 'N/A';
  }

  async predictNextMonthSpend(userId: string): Promise<any> {
    const output = {
      lastMonth: 0,
      nextMonth: 0,
    };
    // Step 1: Aggregate total monthly DEBIT spend per user
    const spends = await this.transactionModel.aggregate([
      {
        $match: {
          userId,
          type: 'DEBIT',
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);
    if (!spends || spends.length === 0) {
      return output;
    }
    if (spends.length < 3) {
      spends.push(spends[0]);
      spends.push(spends[0]);
      //return output; // Not enough data
    }

    // Step 2: Convert to numeric month index and total spend array
    const x = spends.map((_, i) => i + 1);
    const y = spends.map((s) => s.total);

    // Step 3: Train the SLR model
    const regression = new SLR(x, y);

    // Step 4: Predict for next month
    const nextX = x.length + 1;
    const predicted = regression.predict(nextX);
    output.nextMonth = Math.round(predicted);
    output.lastMonth = spends[spends.length - 2].total;
    return output;
  }

  async getAvailableReports(user: any, month: string) {
    const userId = (user._id || '').toString();
    const totalExpenditureInCurrentAndLastMonth =
      await this.transactionModel.aggregate([
        {
          $match: {
            userId: userId,
            type: 'DEBIT',
            month: { $ne: month }, // current month excluded
          },
        },
        {
          $group: {
            _id: '$month',
            totalSpend: { $sum: '$amount' },
          },
        },
        {
          $project: {
            month: '$_id',
            totalSpend: 1,
            _id: 0,
          },
        },
        {
          $sort: {
            month: -1, // sort by latest month first (assuming month = 'YYYY-MM' string)
          },
        },
        {
          $limit: 10,
        },
        {
          $sort: {
            month: 1, // optional: re-sort chronologically
          },
        },
      ]);

    return totalExpenditureInCurrentAndLastMonth;
  }

  async generateMonthlyPdfReport(user: any, month: string, res: Response) {
    const userId = (user._id || '').toString();
    const currencyCode = user.currencyCode || '';
    const transactions = await this.transactionModel.find({
      userId: userId,
      month: month,
    });
    const reportMonth = moment(month).format('MMMM YYYY');
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="monthly-report-${month}.pdf"`,
    );

    doc.pipe(res);

    // Title
    doc
      .fontSize(20)
      .fillColor('#333')
      .text(`Monthly Report for ${reportMonth}`, {
        align: 'center',
      });
    doc.moveDown();

    // Line separator
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke('#cccccc');
    doc.moveDown(0.5);
    // Column configuration
    const columns = [
      { label: 'Date', key: 'day', x: 40, width: 70 },
      { label: `Amount ${currencyCode}`, key: 'amount', x: 120, width: 70 },
      { label: 'Category', key: 'category', x: 200, width: 100 },
      { label: 'Type', key: 'type', x: 320, width: 80 },
      { label: 'Comment', key: 'comment', x: 400, width: 150 },
    ];

    // Calculate header height (in case labels wrap)
    doc.font('Helvetica-Bold').fontSize(12);
    const headerHeights = columns.map((col) =>
      doc.heightOfString(col.label, { width: col.width }),
    );
    const headerHeight = Math.max(...headerHeights) + 4;

    const headerY = doc.y;

    // Draw each column header
    columns.forEach((col) => {
      doc.text(col.label, col.x, headerY, { width: col.width });
    });

    // Move Y to below the header
    doc.y = headerY + headerHeight;

    // Separator line (optional)
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke('#cccccc');

    doc.moveDown(0.3);

    // Transaction rows
    doc.fontSize(11).font('Helvetica');

    transactions.forEach((txn) => {
      const cellPadding = 4;

      const day = moment(txn.day).format('DD/MM/YYYY');
      const amount = txn.amount + '';
      const category = EXPENDITURE_CATEGORIES_MAP[txn.category];
      const type = txn.type;
      const comment = txn.comment || '-';

      const rowY = doc.y;

      // Measure individual cell heights
      const heights = [
        doc.heightOfString(day, { width: 70 }),
        doc.heightOfString(amount, { width: 70 }),
        doc.heightOfString(category, { width: 100 }),
        doc.heightOfString(type, { width: 80 }),
        doc.heightOfString(comment, { width: 150 }),
      ];

      const rowHeight = Math.max(...heights) + cellPadding;

      // Draw each cell at same Y
      doc.text(day, 40, rowY, { width: 70 });
      doc.text(amount, 120, rowY, { width: 70 });
      doc.text(category, 200, rowY, { width: 100 });
      doc.text(type, 320, rowY, { width: 80 });
      doc.text(comment, 400, rowY, { width: 150 });

      // Move to next row
      doc.y = rowY + rowHeight;
    });
    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke('#cccccc');
    doc.moveDown(1.5);

    // Summary
    doc.fontSize(14).fillColor('#000').text('Summary:', { underline: true });
    doc.moveDown();

    const summary = transactions.reduce((acc, txn) => {
      acc[txn.type] = (acc[txn.type] || 0) + txn.amount;
      return acc;
    }, {});

    Object.entries(summary).forEach(([type, total]) => {
      doc.fontSize(12).fillColor('#000').text(`${type}: ${total}`);
    });

    doc.end();
  }
}
