import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@/domain/users/entity/user.entity';
import { Repository } from 'typeorm';
import { message } from '@/constant/message';
import { Product } from '@/domain/product/entities/product.entity';
import { UploadService } from '@/domain/upload/upload.service';
import { Comment } from './entities/comment.entity';
import { FindCommentDTO } from './dto/find-comment.dto';
import { CommentSort } from '@/constant/role';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly uploadService: UploadService,
  ) {}
  async create(
    userId: string,
    createCommentDto: CreateCommentDto,
    productId: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new HttpException(message.FIND_USER_FAIL, HttpStatus.NOT_FOUND);
    }
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new HttpException(message.FIND_PRODUCT_FAIL, HttpStatus.NOT_FOUND);
    }
    const { comment, rate, images } = createCommentDto;

    const imageUrl = [];
    if (images) {
      images.map(async (image) => {
        const imageResponse = await this.uploadService.uploadS3(image);
        imageUrl.push(imageResponse);
      });
    }
    const createdComment = this.commentRepository.create({
      content: comment,
      rate: rate,
      user: user,
      product: product,
    });
    await this.commentRepository.save(createdComment);

    return {
      status: HttpStatus.CREATED,
      data: createdComment,
      message: message.CREATE_COMMENT_SUCCESS,
    };
  }

  async findAllByProductId(productId: string, query: FindCommentDTO) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['comments'],
    });
    if (!product) {
      throw new HttpException(message.FIND_PRODUCT_FAIL, HttpStatus.NOT_FOUND);
    }
    const { sort, limit, offset } = query;

    let sortSection: any = {};

    switch (sort) {
      case CommentSort.NEWEST:
        sortSection = { createdAt: 'DESC' };
        break;
      case CommentSort.LOW_RATE:
        sortSection = { rate: 'ASC' };
        break;
      default:
        sortSection = { rate: 'DESC' };
        break;
    }

    const comment = await this.commentRepository.find({
      where: {
        product: {
          id: productId,
        },
      },
      order: sortSection as { [key: string]: 'ASC' | 'DESC' },
      skip: offset,
      take: limit,
    });
    return {
      status: HttpStatus.OK,
      data: comment,
      message: message.FIND_COMMENT_SUCCESS,
    };
  }

  async findAllByUser(userId: string, query: FindCommentDTO) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['comments'],
    });
    if (!user) {
      throw new HttpException(message.FIND_USER_FAIL, HttpStatus.NOT_FOUND);
    }

    const { sort, limit, offset } = query;

    let sortSection: any = {};

    switch (sort) {
      case CommentSort.NEWEST:
        sortSection = { createdAt: 'DESC' };
        break;
      case CommentSort.LOW_RATE:
        sortSection = { rate: 'ASC' };
        break;
      default:
        sortSection = { rate: 'DESC' };
        break;
    }

    const comments = await this.commentRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
      order: sortSection as { [key: string]: 'ASC' | 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      status: HttpStatus.OK,
      data: comments,
      message: message.FIND_COMMENT_SUCCESS,
    };
  }

  async findOne(id: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: id },
      relations: ['product', 'user'],
    });
    if (!comment) {
      throw new HttpException(message.FIND_COMMENT_FAIL, HttpStatus.NOT_FOUND);
    }
    return {
      status: HttpStatus.OK,
      data: comment,
      message: message.FIND_COMMENT_SUCCESS,
    };
  }

  async update(userId: string, id: string, updateCommentDto: UpdateCommentDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['comments'],
    });

    const userComment = user.comments.find((comment) => comment.id === id);

    if (!userComment) {
      throw new HttpException(message.FIND_COMMENT_FAIL, HttpStatus.NOT_FOUND);
    }
    const { comment, images, rate, status } = updateCommentDto;
    userComment.content = comment;

    const imageUrl = [];
    if (images) {
      images.map(async (image) => {
        const imageResponse = await this.uploadService.uploadS3(image);
        imageUrl.push(imageResponse);
      });
      userComment.images = imageUrl;
    }
    if (status) {
      userComment.status = status;
    }
    userComment.rate = rate;
    await this.commentRepository.save(userComment);
    return {
      status: HttpStatus.OK,
      data: userComment,
      message: message.UPDATE_COMMENT_SUCCESS,
    };
  }

  async remove(userId: string, id: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['comments'],
    });

    const userComment = user.comments.find((comment) => comment.id === id);
    if (!userComment) {
      throw new HttpException(message.FIND_COMMENT_FAIL, HttpStatus.NOT_FOUND);
    }
    await this.commentRepository.remove(userComment);

    return {
      status: HttpStatus.OK,
      message: message.DELETE_COMMENT_SUCCESS,
    };
  }
}
