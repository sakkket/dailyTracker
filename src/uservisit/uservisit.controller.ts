import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UservisitService } from './uservisit.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';

@Controller('uservisit')
export class UservisitController {
  constructor(private readonly uservisitService: UservisitService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getUserVisit(@Request() req) {
    const user = req.user;
    return this.uservisitService.getUserVisit(user);
  }
}
