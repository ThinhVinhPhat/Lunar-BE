import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { message } from '@/constant/message';
import { hashPasswordCompareHelper } from '@/helper/hasPassword';

@Injectable()
export class AuthService {
  constructor(
    private readonly UserService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string,password: string): Promise<Object> {
    const user = await this.UserService.findUser(email);
    if(user) {
      const validPassword = await hashPasswordCompareHelper(password, user.password);
      
      if(!validPassword){
        throw new HttpException(message.SIGN_IN_FAIL,HttpStatus.BAD_REQUEST)
      }
      else{
        const payload = { sub: user.id, email: user.email };
        return {
          access_token: await this.jwtService.signAsync(payload),
        };

      }
    }
    else{
      throw new HttpException(message.USER_NOT_EXISTS,HttpStatus.BAD_REQUEST)
    }
  }


}
