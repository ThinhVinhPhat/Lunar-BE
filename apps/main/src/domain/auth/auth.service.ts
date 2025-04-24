import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '@/domain/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { message } from '@app/constant/message';
import {
  hashPasswordCompareHelper,
  hashTokenCompareHelper,
} from '@app/helper/hasPassword';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RegisterAuthDto } from './dto/register-atuth.dto';
import { loginRespond } from '@app/type/auth/login.respond';
import { ForgotPasswordDto } from './dto/fogort-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@app/entity/user.entity';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { config } from '@app/config';
import { RefreshTokenDto } from './dto/refresh_token.dto';
import { ConfigService } from '@nestjs/config';
import { VerifyAuthDto } from './dto/verify-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly UserService: UsersService,
    private jwtService: JwtService,
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async generateJwt(user: User) {
    const accessToken = await this.jwtService.signAsync(
      {
        iss: config.JWT.ISSUER,
        sub: user.id,
        email: user.email,
      },
      {
        expiresIn: this.configService.getOrThrow('JWT_EXPIRATION_TIME'),
      },
    );
    const refreshToken = await this.jwtService.signAsync(
      {
        iss: config.JWT.ISSUER,
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRATION_TIME'),
      },
    );
    await this.UserService.updateRefreshToken(user.email, refreshToken);
    return { accessToken, refreshToken };
  }

  async login(loginDTO: LoginAuthDto): Promise<loginRespond> {
    const { email, password } = loginDTO;
    const user = await this.UserService.findUser(email);
    const validPassword = await hashPasswordCompareHelper(
      password,
      user.data.password,
    );

    if (!user) {
      throw new UnauthorizedException(message.USER_NOT_EXISTS);
    }

    if (!validPassword) {
      throw new UnauthorizedException(message.PASSWORD_NOT_MATCH);
    }

    if (user.data.status === false) {
      throw new HttpException(message.USER_NOT_ACTIVE, HttpStatus.BAD_REQUEST);
    }

    return {
      accessToken: (await this.generateJwt(user.data)).accessToken,
      refreshToken: (await this.generateJwt(user.data)).refreshToken,
    };
  }

  async register(registerDTO: RegisterAuthDto) {
    return this.UserService.handleRegister(registerDTO);
  }

  async verifyCode(verifyCodeDTO: VerifyAuthDto) {
    const { email, code } = verifyCodeDTO;
    const user = await this.userRepository.findOne({
      where: { email: email },
    });
    if (!user) {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.NOT_FOUND);
    }
    if (user.code_expried < new Date()) {
      throw new HttpException(message.CODE_EXPIRED, HttpStatus.BAD_REQUEST);
    }
    if (user.code_id !== code) {
      throw new HttpException(message.CODE_NOT_MATCH, HttpStatus.BAD_REQUEST);
    }
    user.status = true;
    user.code_id = null;
    user.code_expried = null;
    await this.userRepository.save(user);
    return { message: message.VERIFY_SUCCESS };
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

  async refreshToken(refreshTokenDTO: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDTO;

    const payload = await this.jwtService.verify(refreshToken, {
      secret: config.JWT_REFRESH.SECRET,
    });

    const user = await this.userRepository.findOne({
      where: { email: payload.email },
    });

    const is_equal = await hashTokenCompareHelper(
      refreshToken,
      user.refreshToken,
    );
    if (!is_equal) {
      throw new HttpException(
        ' Refresh token is not equal',
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = await this.generateJwt(user);
    return {
      email: user.email,
      ...token,
    };
  }

  async validateGoogleAccount(googleUser) {
    const user = await this.userRepository.findOne({
      where: { email: googleUser.email },
    });

    if (user) {
      return user;
    }
    const newUser = await this.userRepository.create({
      email: googleUser.email,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
      password: googleUser.password,
      avatar: googleUser.avatar,
    });
    return newUser;
  }
}
