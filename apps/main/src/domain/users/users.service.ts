import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../../../../libs/entity/src/user.entity';
import {
  hashedRefreshToken,
  hashPasswordHelper,
} from '@app/helper/hasPassword';
import { message } from '@app/constant/message';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '@app/constant/role';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { UploadService } from '@/domain/upload/upload.service';
import { reverse } from '@app/helper/reverse';
import { FindDTO } from './dto/find-user.dto';
import { RegisterAuthDto } from '../auth/dto/register-atuth.dto';
import {
  CreateUserResponse,
  GetAllUserResponse,
  GetUserByIdResponse,
  Respond,
  UpdateUserResponse,
} from '@app/type';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user.respond';
import { AppGateway } from '@/domain/gateway/src/app.gateway';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userEntity: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly uploadService: UploadService,
    private readonly gateway: AppGateway,
  ) {}

  private functionUserResponse(
    user: User | User[],
    message: string,
    args?: Record<string, any>,
  ) {
    return {
      data: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
      message,
      ...(args ?? {}),
    };
  }

  async findMe(user: User) {
    return {
      data: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      }),
      message: message.FIND_USER_SUCCESS,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponse> {
    const { firstName, lastName, email, password, role } = createUserDto;

    const hashedPassword = await hashPasswordHelper(password);

    const emailExist = await this.userEntity.findOne({
      where: {
        email: email,
      },
    });

    if (emailExist == null) {
      const user = this.userEntity.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: role !== null ? role : Role.CUSTOMER,
      });
      await this.userEntity.save(user);

      return this.functionUserResponse(user, message.USER_CREATE_SUCCESS);
    } else {
      throw new ConflictException(message.USER_ALREADY_EXISTS);
    }
  }

  async findAll(query: FindDTO): Promise<GetAllUserResponse> {
    const queryList = {
      limit: query.limit ? query.limit : 10,
      offset: query.offset ? query.offset : 0,
      email: query.email ? query.email : null,
      role: query.role ? query.role : undefined,
      isOnline: query.isOnline ? query.isOnline : null,
    };

    const [users, total] = await this.userEntity.findAndCount({
      where: {
        email: queryList.email,
        role: In(queryList.role),
        isOnline: queryList.isOnline,
        status: true,
      },
      skip: queryList.offset,
      take: queryList.limit,
    });

    if (!users) {
      throw new NotFoundException(message.USER_NOT_EXISTS);
    }

    return this.functionUserResponse(users, message.FIND_USER_SUCCESS, {
      total: total,
    });
  }

  // service function only return data
  async findUser(email: string) {
    const user = await this.userEntity.findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new NotFoundException(message.USER_NOT_EXISTS);
    }

    return user;
  }

  async findOne(id: string): Promise<GetUserByIdResponse> {
    const user = await this.userEntity.findOne({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException(message.USER_NOT_EXISTS);
    }
    return this.functionUserResponse(user, message.FIND_USER_SUCCESS);
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    const { firstName, lastName, address, phone, city, company, avatar } =
      updateUserDto;

    const user = await this.userEntity.findOne({ where: { id: userId } });

    let avartarUrl = null;
    if (avatar) {
      if (avatar.length > 1) {
        throw new ConflictException('Only one avatar is allowed');
      }
      avartarUrl = await this.uploadService.uploadS3(avatar[0]);
    }

    if (user) {
      user.firstName = firstName;
      user.lastName = lastName;
      user.address = address;
      user.phone = phone;
      user.city = city;
      user.company = company;
      if (avartarUrl !== null) {
        user.avatar = avartarUrl;
      }
      await this.userEntity.save(user);

      return this.functionUserResponse(user, message.USER_UPDATE_SUCCESS);
    } else {
      throw new NotFoundException(message.USER_NOT_EXISTS);
    }
  }

  async updateByAdmin(
    userId: string,
    UpdateUserDto: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    const { firstName, lastName, role, status } = UpdateUserDto;

    const user = await this.userEntity.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(message.USER_NOT_EXISTS);
    }
    user.firstName = firstName != null ? firstName : user.firstName;
    user.lastName = lastName != null ? lastName : user.lastName;
    user.role = UpdateUserDto.role != null ? role : user.role;
    user.status = UpdateUserDto.status != null ? status : user.status;
    await this.userEntity.save(user);
    return this.functionUserResponse(user, message.USER_UPDATE_SUCCESS);
  }

  async updateRefreshToken(email: string, refreshToken: string) {
    const user = await this.userEntity.findOne({ where: { email } });
    if (user) {
      const hashedToken = await hashedRefreshToken(reverse(refreshToken));
      user.refreshToken = hashedToken;
      await this.userEntity.save(user);
    }
  }

  async updatePassword(
    UpdatePasswordDTO: UpdatePasswordDTO,
  ): Promise<UpdateUserResponse> {
    const { password, code, email } = UpdatePasswordDTO;
    const user = await this.userEntity.findOne({ where: { email: email } });
    if (user) {
      if (user.code_id === code) {
        const hashPassword = await hashPasswordHelper(password);
        user.password = hashPassword;
        await this.userEntity.save(user);
      }
      return this.functionUserResponse(
        user,
        message.USER_PASSWORD_UPDATE_SUCCESS,
      );
    } else {
      throw new NotFoundException(message.USER_NOT_EXISTS);
    }
  }

  async updateOnlineStatus(userId: string) {
    const user = await this.userEntity.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(message.USER_NOT_EXISTS);
    }
    const userSocket = this.gateway.getUserOnline(userId);

    if (!userSocket) {
      user.isOnline = false;
      await this.userEntity.save(user);
    } else {
      const isOnline = userSocket.isOnline;
      user.isOnline = isOnline;
      await this.userEntity.save(user);
    }

    return this.functionUserResponse(
      user,
      message.USER_ONLINE_STATUS_UPDATE_SUCCESS,
    );
  }

  async remove(userId: string): Promise<Respond> {
    const user = await this.userEntity.findOne({ where: { id: userId } });
    if (user) {
      await this.userEntity.remove(user);

      return this.functionUserResponse(user, message.USER_DELETE_SUCCESS);
    } else {
      throw new NotFoundException(message.USER_NOT_EXISTS);
    }
  }

  // service function only return data
  async handleRegister(registerDTO: RegisterAuthDto): Promise<Respond> {
    const { firstName, lastName, email, password, role } = registerDTO;

    const hashedPassword = await hashPasswordHelper(password);

    const emailExist = await this.userEntity.findOne({ where: { email } });
    const randomCode = Math.floor(Math.random() * 1000000) + 1;

    if (emailExist == null) {
      const user = this.userEntity.create({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: role,
        code_id: randomCode.toString(),
        code_expried: dayjs().add(1, 'seconds'),
        status: false,
      });

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Send Email Validation Code',
        text: 'welcome',
        template: './register',
        context: {
          name: user.lastName ?? user.email,
          activationCode: user.code_id,
          email: user.email,
        },
      });

      await this.userEntity.save(user);
      return {
        message: message.SEND_EMAIL_VALIDATION_CODE_SUCCESS,
      };
    } else {
      throw new BadRequestException(message.RESIGTER_FAIL);
    }
  }
}
