import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { message } from '@/constant/message';
import { hashPasswordCompareHelper } from '@/helper/hasPassword';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-atuth.dto';
import { loginRespond } from '@/types/auth/login.respond';
import { ForgotPasswordDto } from './dto/fogort-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/users/entity/user.entity';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly UserService: UsersService,
    private jwtService: JwtService,
    private readonly mailService: MailerService,
  ) {}

  async login(loginDTO: LoginAuthDto): Promise<loginRespond> {
    const { email, password } = loginDTO;
    const user = await this.UserService.findUser(email);
    const validPassword = await hashPasswordCompareHelper(
      password,
      user.data.password,
    );

    if (!validPassword) {
      throw new UnauthorizedException(message.PASSWORD_NOT_MATCH);
    }

    if (user.is_active == false) {
      throw new HttpException(message.USER_NOT_ACTIVE, HttpStatus.BAD_REQUEST);
    }

    const payload = { sub: user.data.id, email: user.data.email };

    return {
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
      },
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  async register(registerDTO: RegisterAuthDto) {
    return this.UserService.handleRegister(registerDTO);
  }

  async forgotPassword(forgotPasswordDTO: ForgotPasswordDto) {
    const { email } = forgotPasswordDTO;
    const user = await this.userRepository.findOne({
      where: {
        email: email,
      },
    });
    if (!user) {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }
    const randomCode = Math.floor(Math.random() * 1000000) + 1;

    const mail = await this.mailService.sendMail({
      to: user.email,
      subject: 'Có cái mật khẩu cũng quên 😡',
      text: 'forgot password',
      template: './forgot',
      context: {
        name: user.lastName ?? user.email,
        resetCode: randomCode.toString(),
      },
    });
    user.code_id = randomCode.toString();
    user.code_expried = dayjs().add(1, 'seconds').toDate();
    await this.userRepository.save(user);

    return { status: 200, message: 'Đã gửi mail' };
  }
}
