import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { ImageTransformer } from '@app/helper/assert';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { NotificationTemplate, User, UserNotification } from '@app/entity';
import { UploadService } from '../upload/upload.service';
import { plainToInstance } from 'class-transformer';
import { NotificationRespondDto } from './dto/notification.resspond.dto';
import { FindNotificationDTO } from './dto/find-notification.dto';
import {
  GetAllNotificationResponse,
  GetNotificationResponse,
  UpdateNotificationResponse,
} from '@app/type/notification/notification.type';
import { message as messageConstant } from '@app/constant';
import { Respond } from '@app/type';
import { CommonService } from '@app/common';
@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private readonly notificationRepository: Repository<NotificationTemplate>,
    @InjectRepository(UserNotification)
    private readonly userNotificationRepository: Repository<UserNotification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly uploadService: UploadService,
    private readonly commonService: CommonService,
  ) {}

  private functionNotificationResponse(
    notification: NotificationTemplate | NotificationTemplate[],
    message: string,
    args?: Record<string, any>,
  ) {
    return {
      data: plainToInstance(NotificationRespondDto, notification, {
        excludeExtraneousValues: true,
      }),
      message,
      ...(args ?? {}),
    };
  }

  async create(createNotificationDto: CreateNotificationDto) {
    const { title, message, image, targetRoles, type } = createNotificationDto;

    const imageUrls = image
      ? await ImageTransformer(image, this.uploadService)
      : [];

    const notification = this.notificationRepository.create({
      title: title,
      message: message,
      image: imageUrls,
      targetRoles: targetRoles,
      isGlobal: targetRoles === undefined,
      type: type,
    });
    await this.notificationRepository.save(notification);
    return this.functionNotificationResponse(
      notification,
      messageConstant.CREATE_NOTIFICATION_SUCCESS,
    );
  }

  async findAll(
    query: FindNotificationDTO,
  ): Promise<GetAllNotificationResponse> {
    const { limit, page, name, targetRoles } = query;
    const where = {
      name: name ? Like(`%${name}%`) : undefined,
      targetRoles: targetRoles ? In(targetRoles) : undefined,
    };
    const { skip } = this.commonService.getPaginationMeta(page, limit);

    const [notifications, total] =
      await this.notificationRepository.findAndCount({
        where,
        take: limit,
        skip: skip,
      });
    return this.functionNotificationResponse(
      notifications,
      messageConstant.FIND_NOTIFICATION_SUCCESS,
      {
        meta: {
          total: total,
          totalPage: Math.ceil(total / limit),
        },
      },
    );
  }

  async findByUser(
    userId: string,
    query: FindNotificationDTO,
  ): Promise<GetAllNotificationResponse> {
    const { limit, page } = query;
    const currentUser = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'role'],
    });
    if (!currentUser) {
      throw new NotFoundException(messageConstant.USER_NOT_EXISTS);
    }
    const { skip } = this.commonService.getPaginationMeta(page, limit);

    const [notifications, total] = await this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.isGlobal = true')
      .orWhere('notification.targetRoles LIKE :role', {
        role: `%${currentUser.role}%`,
      })
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const userNotification = await this.userNotificationRepository.find({
      where: {
        userId: currentUser.id,
      },
      relations: {
        notification: true,
      },
    });

    return this.functionNotificationResponse(
      notifications,
      messageConstant.FIND_NOTIFICATION_SUCCESS,
      {
        meta: {
          total: total,
          totalPage: Math.ceil(total / limit),
        },
        userNotification: userNotification,
      },
    );
  }

  async findOne(id: string): Promise<GetNotificationResponse> {
    const notification = await this.notificationRepository.findOne({
      where: { id: id },
    });
    if (!notification) {
      throw new NotFoundException(messageConstant.FIND_NOTIFICATION_FAIL);
    }
    return;
  }

  async update(
    id: string,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<UpdateNotificationResponse> {
    const { title, message, image, targetRoles, type, status } =
      updateNotificationDto;
    const notification = await this.notificationRepository.findOne({
      where: { id: id },
    });
    if (!notification) {
      throw new NotFoundException(messageConstant.FIND_NOTIFICATION_FAIL);
    }
    const imageUrls = image
      ? await ImageTransformer(image, this.uploadService)
      : [];
    notification.title = title ?? notification.title;
    notification.message = message ?? notification.message;
    notification.image = imageUrls ?? notification.image;
    notification.type = type ?? notification.type;
    notification.status = status ?? notification.status;
    notification.targetRoles = targetRoles ?? notification.targetRoles;
    await this.notificationRepository.save(notification);
    return this.functionNotificationResponse(
      notification,
      messageConstant.UPDATE_NOTIFICATION_SUCCESS,
    );
  }

  async updateStatus(id: string, userId: string): Promise<Respond> {
    const notification = await this.notificationRepository.findOne({
      where: { id: id },
    });
    if (!notification) {
      throw new NotFoundException(messageConstant.FIND_NOTIFICATION_FAIL);
    }
    const existUserNotification = await this.userNotificationRepository.findOne(
      {
        where: {
          userId: userId,
          notification: {
            id: id,
          },
        },
      },
    );
    if (existUserNotification) {
      throw new ConflictException(messageConstant.ALREADY_READ);
    }

    const userNotification = await this.userNotificationRepository.create({
      userId: userId,
      notification: notification,
      isRead: true,
    });
    await this.userNotificationRepository.save(userNotification);
    return {
      message: messageConstant.UPDATE_NOTIFICATION_SUCCESS,
    };
  }

  async updateAllStatus(userId: string): Promise<Respond> {
    await this.userNotificationRepository.update(
      {
        userId: userId,
      },
      {
        isRead: true,
      },
    );
    return {
      message: messageConstant.UPDATE_NOTIFICATION_SUCCESS,
    };
  }

  async remove(id: string): Promise<Respond> {
    const notification = await this.notificationRepository.findOne({
      where: { id: id },
    });
    if (!notification) {
      throw new NotFoundException(messageConstant.FIND_NOTIFICATION_FAIL);
    }
    await this.notificationRepository.remove(notification);
    return {
      message: messageConstant.DELETE_NOTIFICATION_SUCCESS,
    };
  }
}
