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


@Injectable()
export class AuthService {
  constructor(
    private readonly UserService: UsersService,
    private jwtService: JwtService,
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
}
