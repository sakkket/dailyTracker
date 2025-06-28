import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Delete,
  Put,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from 'src/dto/create-transaction.dto';
import UpdateTransactionDto from 'src/dto/update-transaction.dto';
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
    return this.transactionService.getTotalExpenditureAndIncome(
      user,
      month,
      year,
      type,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/list')
  getTransactions(
    @Request() req,
    @Query('month') month: string,
    @Query('year') year: string,
    @Query('type') type: string,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('category') category: string,
  ): any {
    const user = req.user;
    return this.transactionService.getTransactionsList(
      user,
      month,
      year,
      type,
      limit,
      offset,
      category,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @Request() req) {
    const user: User = req.user;
    return this.transactionService.create(createTransactionDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  updateTransaction(
    @Query('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Request() req,
  ) {
    const user: User = req.user;
    return this.transactionService.updateTransaction(id, updateTransactionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteTransaction(@Request() req, @Query('id') id: string): any {
    const user = req.user;
    return this.transactionService.deleteExpenditure(user, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('insights')
  getInsights(@Request() req, @Query('month') month: string): any {
    const user: any = req?.user;
    return this.transactionService.getInsights(user, month);
  }
}
