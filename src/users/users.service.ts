import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { createRespond } from '@/types/user/create-respond';
import { hashPasswordHelper } from '@/helper/hasPassword';
import { message } from '@/constant/message';
import { findRespond } from '@/types/user/find-respond';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<createRespond> {
    const { name, email, password, address, phone, images } = createUserDto;

    const hashedPassword = await hashPasswordHelper(password);

    const emailExist = await this.userModel.findOne({ email });
    console.log(emailExist);

    if (emailExist == null) {
      const user = await this.userModel.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        images,
      });

      await user.save();
      return {
        status: HttpStatus.ACCEPTED,
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        images: user.images,
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

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPage = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const result = await this.userModel
      .find(filter)
      .limit(+pageSize)
      .skip(skip)
      .sort(sort as any);

    if (!result) {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }

    return {
      status: HttpStatus.ACCEPTED,
      Users: result.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        images: user.images,
      })),
      message: message.FIND_USER_SUCCESS,
    };
  }

  async findOne(id: string): Promise<createRespond> {
    const user = await this.userModel.findOne({ _id: id });

    if (!user) {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }
    return {
      status: HttpStatus.ACCEPTED,
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      images: user.images,
      message: message.USER_CREATE_SUCCESS,
    };
  }

  async update(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<createRespond> {
    const { name, address, phone, images } = updateUserDto;
    const ValidId = mongoose.isValidObjectId(userId);
    if (ValidId) {
      await this.userModel.updateOne(
        { _id: userId },
        { name, address, phone, images },
      );

      const user = await this.userModel.findOne({ _id: userId });

      return {
        status: HttpStatus.ACCEPTED,
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone,
        images: user.images,
        message: message.USER_UPDATE_SUCCESS,
      };
    } else {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }
  }

  async remove(userId: string): Promise<HttpException> {
    const ValidId = mongoose.isValidObjectId(userId);
    if (ValidId) {
      await this.userModel.deleteOne({ _id: userId });

      return new HttpException(
        message.USER_DELETE_SUCCESS,
        HttpStatus.ACCEPTED,
      );
    } else {
      throw new HttpException(message.USER_NOT_EXISTS, HttpStatus.BAD_REQUEST);
    }
  }
}
