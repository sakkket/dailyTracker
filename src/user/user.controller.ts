import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { LoginDto } from 'src/dto/login.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.gaurd';
import { UpdateUserDto } from 'src/dto/update-user.dto';

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

  @UseGuards(JwtAuthGuard)
  @Put()
  updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(updateUserDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.userService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/validate')
  verify(@Request() req) {
    const user = JSON.parse(JSON.stringify(req.user));
    delete user.password;
    user["id"] = user._id;
    delete user._id;
    return user;
  }
}
