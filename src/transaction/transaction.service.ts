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
            expense['totalExpenditure'] = expense['totalExpenditure'] + expense[key];
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
    const expenditurePipelineQuery: PipelineStage[] = [
      {
        $match: {
          month: month,
          userId: userId,
          type: 'DEBIT',
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ];
    const expenditureResult: any = await this.transactionModel.aggregate(expenditurePipelineQuery);
    const totalExpenses = expenditureResult[0] ?? { totalAmount: 0 };

    const incomePipelineQuery: PipelineStage[] = [
      {
        $match: {
          month: month,
          userId: userId,
          type: 'CREDIT',
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
        },
      },
    ];
    const incomeResult: any =
      await this.transactionModel.aggregate(incomePipelineQuery);
    const totalIncome = incomeResult[0] ?? { totalAmount: 0 };

    return {totalExpenses: totalExpenses, totalIncome: totalIncome };
  }
}
