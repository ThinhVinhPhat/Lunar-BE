import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import { createRespond } from '@/types/user/create-respond';
import { hashedRefreshToken, hashPasswordHelper } from '@/helper/hasPassword';
import { message } from '@/constant/message';
import { findRespond } from '@/types/user/find-respond';
import { RegisterAuthDto } from '@/auth/dto/register-atuth.dto';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@/constant/role';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { UploadService } from '@/upload/upload.service';
import { reverse } from '@/helper/reverse';
import { FindDTO } from './dto/find-user.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userEntity: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly uploadService: UploadService,
  ) {}

  async findMe(user: User) {
    return {
      status: HttpStatus.OK,
      data: user,
      message: message.FIND_USER_SUCCESS,
    };
  }

  async create(createUserDto: CreateUserDto): Promise<createRespond> {
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

      return {
        status: HttpStatus.ACCEPTED,
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          company: user.company,
          address: user.address,
          phone: user.phone,
          city: user.city,
          role: user.role,
        },
        message: message.USER_CREATE_SUCCESS,
      };
    } else {
      throw new HttpException(
        message.USER_ALREADY_EXISTS,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(query: FindDTO): Promise<findRespond> {
    console.log(query);

    const queryList = {
      limit: query.limit ? query.limit : 10,
      offset: query.offset ? query.offset : 0,
      email: query.email ? query.email : null,
      role: query.role ? query.role : Role.CUSTOMER,
    };

    const users = await this.userEntity.find({
      where: {
        email: queryList.email,
        role: queryList.role,
      },
      skip: queryList.offset,
      take: queryList.limit,
    });

    if (!users) {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }

    return {
      status: HttpStatus.ACCEPTED,
      data: users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        company: user.company,
        address: user.address,
        phone: user.phone,
        city: user.city,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      })),
      message: message.FIND_USER_SUCCESS,
    };
  }

  async findUser(email: string): Promise<any> {
    const user = await this.userEntity.findOne({
      where: {
        email: email,
      },
    });
    return {
      status: HttpStatus.ACCEPTED,
      data: {
        id: user.id,
        email: user.email,
        password: user.password,
        status: user.status,
      },
      message: message.USER_CREATE_SUCCESS,
    };
  }

  async findOne(id: string): Promise<createRespond> {
    const user = await this.userEntity.findOne({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }
    return {
      status: HttpStatus.ACCEPTED,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        address: user.address,
        phone: user.phone,
        city: user.city,
        role: user.role,
        avatar: user.avatar,
      },
      message: message.USER_CREATE_SUCCESS,
    };
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<createRespond> {
    const { firstName, lastName, address, phone, city, company, avatar } =
      updateUserDto;

    const user = await this.userEntity.findOne({ where: { id: userId } });

    let avartarUrl = null;
    if (avatar) {
      if (avatar.length > 1) {
        throw new HttpException(
          'Only one avatar is allowed',
          HttpStatus.BAD_REQUEST,
        );
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

      return {
        status: HttpStatus.OK,
        data: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          company: user.company,
          address: user.address,
          phone: user.phone,
          city: user.city,
          role: user.role,
          avatar: user.avatar,
        },
        message: message.USER_CREATE_SUCCESS,
      };
    } else {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }
  }

  async updateByAdmin(
    userId: string,
    UpdateUserDto: UpdateUserDto,
  ): Promise<createRespond> {
    const { firstName, lastName, role, status } = UpdateUserDto;

    const user = await this.userEntity.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }
    user.firstName = firstName != null ? firstName : user.firstName;
    user.lastName = lastName != null ? lastName : user.lastName;
    user.role = UpdateUserDto.role != null ? role : user.role;
    user.status = UpdateUserDto.status != null ? status : user.status;
    await this.userEntity.save(user);
    return {
      status: HttpStatus.OK,
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        address: user.address,
        phone: user.phone,
        city: user.city,
        role: user.role,
        avatar: user.avatar,
      },
      message: message.USER_CREATE_SUCCESS,
    };
  }

  async updateRefreshToken(email: string, refreshToken: string) {
    const user = await this.userEntity.findOne({ where: { email } });
    if (user) {
      const hashedToken = await hashedRefreshToken(reverse(refreshToken));
      user.refreshToken = hashedToken;
      await this.userEntity.save(user);
    }
  }

  async updatePassword(UpdatePasswordDTO: UpdatePasswordDTO) {
    const { password, code, email } = UpdatePasswordDTO;
    const user = await this.userEntity.findOne({ where: { email: email } });
    if (user) {
      if (user.code_id === code) {
        const hashPassword = await hashPasswordHelper(password);
        user.password = hashPassword;
        await this.userEntity.save(user);
      }
      return {
        status: HttpStatus.ACCEPTED,
        data: user,
        message: message.USER_PASSWORD_UPDATE_SUCCESS,
      };
    } else {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(userId: string) {
    const user = await this.userEntity.findOne({ where: { id: userId } });
    if (user) {
      await this.userEntity.remove(user);

      return {
        status: HttpStatus.ACCEPTED,
        message: message.USER_DELETE_SUCCESS,
      };
    } else {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }
  }
  async handleRegister(registerDTO: RegisterAuthDto) {
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

      const mail = await this.mailerService.sendMail({
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
        status: HttpStatus.ACCEPTED,
        message: 'Send email validation code',
      };
    } else {
      throw new HttpException(message.RESIGTER_FAIL, HttpStatus.BAD_REQUEST);
    }
  }
}
