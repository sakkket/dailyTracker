import { Model, Types } from 'mongoose';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Transaction } from 'src/interfaces/transaction.interface';
import { CreateTransactionDto } from 'src/dto/create-transaction.dto';
import { PipelineStage } from 'mongoose';
import { User } from '../interfaces/user.interface';

@Injectable()
export class TransactionService {
  constructor(
    @Inject('TRANSACTION_MODEL')
    private transactionModel: Model<Transaction>,
  ) {}

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
          if(expense[key] === 0){
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
    const totalPipelineQuery: PipelineStage[] = [
      {
        $match: {
          month: month,
          userId: userId,
        },
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
    const transactionsCount = await this.transactionModel.countDocuments(query);
    const transactions: any[] = await this.transactionModel
      .find(query)
      .sort({ day: -1 })
      .skip(offset)
      .limit(limit);
    return { transactions: transactions, totalCount: transactionsCount };
  }
}
