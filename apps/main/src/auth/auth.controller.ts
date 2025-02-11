import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterAuthDto } from './dto/register-atuth.dto';
import { Public } from '@app/decorator/public.decorator';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(JwtAuthGuard)
  @Post('/login')
  create(@Body() login: LoginAuthDto) {
    return this.authService.login(login);
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @Post('/register')
  profile(@Body() registerDTO: RegisterAuthDto) {
    return this.authService.register(registerDTO);
  }
}
