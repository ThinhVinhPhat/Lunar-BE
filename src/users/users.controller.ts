import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { UserReq } from '@/common/decorator/user.decorator';
import { User } from './entity/user.entity';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @Get('/me')
  getMe(@UserReq() user: User) {
    return user;
  }

  @ApiBearerAuth()
  @Get('/find-all')
  findAll(
    @Query() query: string,
    @Query('current') current: number,
    @Query('pageSize') pageSize: number,
  ) {
    return this.usersService.findAll(query, current, pageSize);
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiBearerAuth()
  @Patch('update/:id')
  update(@Param('id') userid: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(userid, updateUserDto);
  }

  @ApiBearerAuth()
  @Delete('delete/:id')
  remove(@Param('id') userId: string) {
    return this.usersService.remove(userId);
  }
}
