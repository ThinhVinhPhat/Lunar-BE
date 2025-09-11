import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RolesGuard } from '../guard/roles.guard';
import { Role } from '@app/constant';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { Roles } from '@app/decorator/role.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiSecurity,
} from '@nestjs/swagger';
import { FindNotificationDTO } from './dto/find-notification.dto';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@app/entity';
import { AppGateway } from '../gateway/src/app.gateway';

@ApiTags('Notification')
@ApiSecurity('X-API-KEY')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly gateway: AppGateway,
  ) {}

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Create a new notification',
    description: 'Create a new notification',
    type: CreateNotificationDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('image'))
  @Roles(Role.ADMIN)
  @Post()
  async create(
    @UploadedFiles() image: Express.Multer.File[],
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    const notification = await this.notificationService.create({
      ...createNotificationDto,
      image: image,
    });
    this.gateway.server.emit('notification_updated');
    return notification;
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Find notifications',
    description: 'Find notifications',
    type: FindNotificationDTO,
  })
  @Get()
  findAll(@Query() query: FindNotificationDTO) {
    return this.notificationService.findAll(query);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Find notifications by user',
    description: 'Find notifications by user',
    type: FindNotificationDTO,
  })
  @Get('/me')
  findByUser(
    @UserReq() currentUser: User,
    @Query() query: FindNotificationDTO,
  ) {
    const userId = currentUser.id;
    return this.notificationService.findByUser(userId, query);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Find a notification',
    description: 'Find a notification',
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Update a notification',
    description: 'Create a notification',
    type: CreateNotificationDto,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  @Roles(Role.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @UploadedFiles() image: Express.Multer.File[],
    @Body() updateNotificationDto: UpdateNotificationDto,
  ) {
    const notification = await this.notificationService.update(id, {
      ...updateNotificationDto,
      image: image,
    });

    this.gateway.server.emit('notification_updated');
    return notification;
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Update a notification status',
    description: ' Update a notification status',
  })
  @Patch('/update-status/:id')
  updateStatus(@UserReq() currentUser: User, @Param('id') id: string) {
    const userId = currentUser.id;
    if (id === 'all') {
      return this.notificationService.updateAllStatus(userId);
    }
    return this.notificationService.updateStatus(id, userId);
  }

  @ApiBearerAuth()
  @ApiOperationDecorator({
    summary: 'Delete a notification',
    description: 'Delete a notification',
  })
  @Delete(':id')
  remove(@Param('id') id: string) {
    this.gateway.server.emit('notification_updated');
    return this.notificationService.remove(id);
  }
}
