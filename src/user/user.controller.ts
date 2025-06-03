import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { LoginDto } from 'src/dto/login.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(): any {
    return this.userService.findAll();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/validate')
  verify(@Request() req) {
    return req.user;
  }
}
