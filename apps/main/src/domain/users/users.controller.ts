import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UnprocessableEntityException,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '../../../../../libs/entity/src/user.entity';
import { Public } from '@app/decorator/public.decorator';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { JwtAuthGuard } from '@/domain/auth/jwt-auth.guard';
import { Roles } from '@app/decorator/role.decorator';
import { Role } from '@app/constant/role';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FindDTO } from './dto/find-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Create User',
    description: 'Create a new user',
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiBearerAuth()
  @Get('/me')
  getMe(@UserReq() user: User) {
    return this.usersService.findMe(user);
  }

  @ApiBearerAuth()
  @Get('/find-all')
  findAll(@Query() query: FindDTO) {
    return this.usersService.findAll(query);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('avatar'))
  @ApiOperationDecorator({
    summary: 'Update user',
    description: 'Update user information',
    type: UpdateUserDto,
  })
  @Patch('update')
  update(
    @UserReq() currentUser: User,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFiles() avatar: Express.Multer.File[],
  ) {
    const userId = currentUser.id;
    return this.usersService.update(userId, {
      ...updateUserDto,
      avatar: avatar,
    });
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Update user By Admin',
    description: 'Update user By Admin',
    type: UpdateUserDto,
  })
  @Patch('update-by-admin/:id')
  updateByAdmin(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateByAdmin(userId, updateUserDto);
  }

  @Public()
  @UseGuards(JwtAuthGuard)
  @ApiOperationDecorator({
    summary: 'User reset password',
    description: 'User reset password',
    type: UpdatePasswordDTO,
  })
  @Patch('update/update-password')
  updatePassword(@Body() updatePassword: UpdatePasswordDTO) {
    if (Object.keys(updatePassword).length == 0) {
      throw new UnprocessableEntityException(
        'Cannot update password with empty data',
      );
    }
    try {
      return this.usersService.updatePassword(updatePassword);
    } catch (error) {
      throw new Error(error.message);
    }
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @Delete('delete/:id')
  remove(@Param('id') userId: string) {
    return this.usersService.remove(userId);
  }
}
