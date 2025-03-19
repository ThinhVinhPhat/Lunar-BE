import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entity/user.entity';
import { createRespond } from '@/types/user/create-respond';
import { hashPasswordHelper } from '@/helper/hasPassword';
import { message } from '@/constant/message';
import { findRespond } from '@/types/user/find-respond';
import aqp from 'api-query-params';
import { RegisterAuthDto } from '@/auth/dto/register-atuth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '@/constant/role';
import { UpdatePasswordDTO } from './dto/update-password.dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userEntity: Repository<User>,
    private readonly mailerService: MailerService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<createRespond> {
    const {
      firstName,
      lastName,
      email,
      password,
      address,
      phone,
      city,
      company,
      role,
    } = createUserDto;

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
        phone,
        address,
        city,
        company,
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

  async findAll(
    query: string,
    current: number,
    pageSize: number,
  ): Promise<findRespond> {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    if (!current) current = 1;
    if (!pageSize) pageSize = 10;

    const totalItems = (await this.userEntity.find(filter)).length;
    const totalPage = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const result = await this.userEntity.find({
      where: filter, // Điều kiện lọc
      skip: skip, // Bỏ qua `skip` bản ghi đầu tiên
      take: pageSize, // Lấy `pageSize` bản ghi
      order: sort, // Sắp xếp theo trường
    });

    if (!result) {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }

    return {
      status: HttpStatus.ACCEPTED,
      data: result.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        address: user.address,
        phone: user.phone,
        city: user.city,
        role: user.role,
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
      },
      message: message.USER_CREATE_SUCCESS,
    };
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<createRespond> {
    const { firstName, lastName, address, phone, city, company } =
      updateUserDto;

    const user = await this.userEntity.findOne({ where: { id: userId } });

    if (user) {
      user.firstName = firstName;
      user.lastName = lastName;
      user.address = address;
      user.phone = phone;
      user.city = city;
      user.company = company;
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
        },
        message: message.USER_CREATE_SUCCESS,
      };
    } else {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
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

  async remove(userId: string): Promise<HttpException> {
    const user = await this.userEntity.findOne({ where: { id: userId } });
    if (user) {
      await this.userEntity.remove(user);

      return new HttpException(
        message.USER_DELETE_SUCCESS,
        HttpStatus.ACCEPTED,
      );
    } else {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }
  }
  async handleRegister(registerDTO: RegisterAuthDto) {
    const { firstName, lastName, email, password } = registerDTO;

    const hashedPassword = await hashPasswordHelper(password);

    const emailExist = await this.userEntity.findOne({ where: { email } });
    const randomCode = Math.floor(Math.random() * 1000000) + 1;

    if (emailExist == null) {
      const user = this.userEntity.create({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        code_id: randomCode.toString(),
        code_expried: dayjs().add(1, 'seconds'),
      });

      const mail = await this.mailerService.sendMail({
        to: user.email,
        subject: 'Send Email Validation Code',
        text: 'welcome',
        template: './register',
        context: {
          name: user.lastName ?? user.email,
          activationCode: user.code_id,
        },
      });

      console.log(mail);

      await this.userEntity.save(user);
      return {
        status: HttpStatus.ACCEPTED,
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        message: message.RESIGTER_SUCCESS,
      };
    } else {
      throw new HttpException(message.RESIGTER_FAIL, HttpStatus.BAD_REQUEST);
    }
  }
}
