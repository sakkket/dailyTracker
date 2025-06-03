import { Model } from 'mongoose';
import { Injectable, Inject, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from 'src/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    const createUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.userModel.findOne({ email: loginDto.email });
    if (!user) {
      throw new NotFoundException();
    }
    // Password check here
    const isMatch = await bcrypt.compare(loginDto.password, user?.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);
    const response = {
      user: user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
    return response;
  }
}
