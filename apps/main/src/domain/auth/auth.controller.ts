import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterAuthDto } from './dto/register-atuth.dto';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { ForgotPasswordDto } from './dto/fogort-password.dto';
import { RefreshTokenDto } from './dto/refresh_token.dto';
import { GoogleAuthGuard } from './google-auth.guard';
import { VerifyAuthDto } from './dto/verify-auth.dto';
import { Public } from '@app/decorator/public.decorator';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperationDecorator({
    summary: 'Login',
    description: 'Login with email and password',
  })
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
  @ApiOperationDecorator({
    summary: 'Register',
    description: 'Register with email and password',
  })
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
    summary: 'Verify register user',
    description: 'Verify register user',
  })
  @Post('/verify')
  verify(@Body() verify: VerifyAuthDto) {
    return this.authService.verifyCode(verify);
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

  @Public()
  @ApiOperationDecorator({
    summary: 'reset refresh token',
    description: 'reset refresh token',
  })
  @Post('/refresh-token')
  refreshToken(@Body() refreshToken: RefreshTokenDto) {
    return this.authService.refreshToken(refreshToken);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperationDecorator({
    summary: 'google login',
    description: 'google login',
  })
  @Get('/google/login')
  googleLogin() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperationDecorator({
    summary: 'google callback',
    description: 'google callback',
  })
  @Get('/google/callback')
  async googleCallback(@Req() req, @Res() res) {
    const response = await this.authService.generateJwt(req.user);
    res.redirect(
      `http://localhost:5173?token=${response.accessToken}& refreshToken=${response.refreshToken}`,
    );
  }
}
