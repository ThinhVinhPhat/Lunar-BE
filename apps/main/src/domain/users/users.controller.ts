import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
import { JwtAuthGuard } from '@/domain/guard/jwt-auth.guard';
import { Roles } from '@app/decorator/role.decorator';
import { Role } from '@app/constant/role';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FindDTO } from './dto/find-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RolesGuard } from '../guard/roles.guard';
import { UuidValidatePipe } from '@app/pipe';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
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
  @ApiOperationDecorator({
    summary: 'Find User Detail',
    description: 'Find User Detail',
  })
  @Get('/me')
  getMe(@UserReq() user: User) {
    return this.usersService.findMe(user);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ENGINEER)
  @ApiOperationDecorator({
    summary: 'Find all User',
    description: 'Find all User',
  })
  @Get('/find-all')
  findAll(@Query() query: FindDTO) {
    return this.usersService.findAll(query);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.ENGINEER)
  @ApiOperationDecorator({
    summary: 'Find User by Id',
    description: 'Find User by Id',
  })
  @Get(':id')
  findOne(@Param('id', UuidValidatePipe) id: string) {
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
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Update user By Admin',
    description: 'Update user By Admin',
    type: UpdateUserDto,
  })
  @Patch('update-by-admin/:id')
  updateByAdmin(
    @Param('id', UuidValidatePipe) userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateByAdmin(userId, updateUserDto);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Update user Online Status',
    description: ' Update user Online Status',
    type: UpdateUserDto,
  })
  @Patch('update-online-status')
  updateOnlineStatus(@UserReq() currentUser: User) {
    const userId = currentUser.id;
    return this.usersService.updateOnlineStatus(userId);
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
    return this.usersService.updatePassword(updatePassword);
  }

  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperationDecorator({
    summary: 'Disable user',
    description: 'Disable user',
    type: UpdatePasswordDTO,
  })
  @Delete('delete/:id')
  remove(@Param('id', UuidValidatePipe) userId: string) {
    return this.usersService.remove(userId);
  }
}
