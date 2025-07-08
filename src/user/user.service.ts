import { Model } from 'mongoose';
import {
  Injectable,
  Inject,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { User } from '../interfaces/user.interface';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from 'src/dto/login.dto';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDto } from 'src/dto/update-user.dto';
import * as si from 'systeminformation';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_MODEL')
    private userModel: Model<User>,
    private authService: AuthService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (userExists) {
      throw new BadRequestException('User already exists');
    }
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltOrRounds,
    );
    delete createUserDto.confirmPassword;
    const createUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });
    return createUser.save();
  }

  async updateUser(updateUserDto: UpdateUserDto) {
    const updatePayload = {};
    if (updateUserDto.name) {
      updatePayload['name'] = updateUserDto.name;
    }
    if (updateUserDto.phone) {
      updatePayload['phone'] = updateUserDto.phone;
    }
    if (updateUserDto.newPassword) {
      const user = await this.userModel.findById(updateUserDto.id);
      if (user) {
        const isMatch = await bcrypt.compare(
          updateUserDto.password,
          user.password,
        );
        if (!isMatch) {
          throw new UnauthorizedException('Current password is not matching');
        }
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(
          updateUserDto.newPassword,
          saltOrRounds,
        );
        updatePayload['password'] = hashedPassword;
      }
    }
    const updatedUser = await this.userModel.findByIdAndUpdate(
      updateUserDto.id,
      {
        $set: updatePayload,
      },
      { new: true },
    );
    return updatedUser;
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
    const userObj: any = JSON.parse(JSON.stringify(user));
    delete userObj.password;
    delete userObj._id;
    const accessToken = this.authService.generateAccessToken(userObj);
    const refreshToken = this.authService.generateRefreshToken(userObj);
    const response = {
      user: userObj,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
    return response;
  }

  async getSystemInfo() {
    const [cpuTemp, currentLoad, mem, os] = await Promise.all([
      si.cpuTemperature(),
      si.currentLoad(),
      si.mem(),
      si.osInfo(),
    ]);

    return {
      hostname: os.hostname,
      platform: os.platform,
      architecture: os.arch,
      cpuTemperature: cpuTemp.main, // °C
      cpuUsage: currentLoad.cpus.map((cpu) => cpu.load), // array of core usage
      memory: {
        used: +(mem.used / (1024 ** 3)).toFixed(2),   // in GB
        total: +(mem.total / (1024 ** 3)).toFixed(2), // in GB
      },
    };
  }
}
