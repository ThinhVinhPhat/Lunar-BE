import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from '@/common/decorator/public.decorator';
import { RegisterAuthDto } from './dto/register-atuth.dto';
import { ApiOperationDecorator } from '@/common/decorator/api-operation.decorator';
import { ForgotPasswordDto } from './dto/fogort-password.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiOperationDecorator({
    summary: 'Login',
    description: 'Login with username and password',
    type: LoginAuthDto,
  })
  @Post('/login')
  create(@Body() login: LoginAuthDto) {
    return this.authService.login(login);
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiOperationDecorator({
    summary: 'Register',
    description: 'Register with username and password',
    type: RegisterAuthDto,
  })
  @Post('/register')
  profile(@Body() registerDTO: RegisterAuthDto) {
    return this.authService.register(registerDTO);
  }

  @Public()
  @ApiOperationDecorator({
    summary: 'forgot-password',
    description: 'forgot-password',
    type: ForgotPasswordDto,
  })
  @Post('/forgot-password')
  forgotPassword(@Body() forgotPasswordDTO: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDTO);
  }
}
