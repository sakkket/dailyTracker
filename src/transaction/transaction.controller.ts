import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from 'src/dto/create-transaction.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { User } from 'src/interfaces/user.interface';
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getExpenses(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('groupby') groupBy: string,
  ): any {
    const user = req.user;
    return this.transactionService.getExpenditures(user, month, year, groupBy);
  }

  @UseGuards(JwtAuthGuard)
  @Get('total')
  getTotalExpense(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('type') type: string,
  ): any {
    const user = req.user;
    return this.transactionService.getTotalExpenditureAndIncome(user, month, year, type);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    const user: User = req.user;
    return this.transactionService.create(createTransactionDto, user);
  }
}
