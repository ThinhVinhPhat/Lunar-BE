import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from '@/common/decorator/public.decorator';
import { RegisterAuthDto } from './dto/register-atuth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @Public()
  create(@Body() login: LoginAuthDto) {
    return this.authService.login(login);
  }

  @ApiBearerAuth()
  @Public()
  @UseGuards(JwtAuthGuard)
  @Post('/register')
  profile(@Body() registerDTO: RegisterAuthDto) {
    return this.authService.register(registerDTO);
  }
}
