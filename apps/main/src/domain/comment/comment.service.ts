import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '@app/entity/user.entity';
import { Repository } from 'typeorm';
import { message } from '@app/constant/message';
import { Product } from '@app/entity/product.entity';
import { UploadService } from '@/domain/upload/upload.service';
import { Comment } from '../../../../../libs/entity/src/comment.entity';
import { FindCommentDTO } from './dto/find-comment.dto';
import { CommentSort } from '@app/constant/role';
import {
  CreateCommentResponse,
  GetAllCommentResponse,
  GetCommentByIdResponse,
  Respond,
  UpdateCommentResponse,
} from '@app/type';
import { plainToInstance } from 'class-transformer';
import { CommentRespondDto } from './dto/comment.respond.dto';

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

  private functionCommentResponse(
    comment: Comment | Comment[],
    message: string,
    args?: Record<string, any>,
  ) {
    return {
      data: plainToInstance(CommentRespondDto, comment, {
        excludeExtraneousValues: true,
      }),
      message,
      ...(args ?? {}),
    };
  }

  async create(
    userId: string,
    createCommentDto: CreateCommentDto,
    productId: string,
  ): Promise<CreateCommentResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(message.FIND_USER_FAIL);
    }
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(message.FIND_PRODUCT_FAIL);
    }
    const { comment, rate, images } = createCommentDto;

    let imageUrl: string[] = [];

    if (images && images.length > 0) {
      imageUrl = await Promise.all(
        images.map((image) => this.uploadService.uploadS3(image)),
      );
    }

    const createdComment = this.commentRepository.create({
      content: comment,
      rate: rate,
      user: user,
      product: product,
      images: imageUrl,
    });
    await this.commentRepository.save(createdComment);

    return this.functionCommentResponse(
      createdComment,
      message.CREATE_COMMENT_SUCCESS,
    );
  }

  async findAllByProductId(
    productId: string,
    query: FindCommentDTO,
  ): Promise<GetAllCommentResponse> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['comments'],
    });
    if (!product) {
      throw new NotFoundException(message.FIND_PRODUCT_FAIL);
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
    return this.functionCommentResponse(comment, message.FIND_COMMENT_SUCCESS);
  }

  async findAllByUser(
    userId: string,
    query: FindCommentDTO,
  ): Promise<GetAllCommentResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['comments'],
    });
    if (!user) {
      throw new NotFoundException(message.FIND_USER_FAIL);
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

    return this.functionCommentResponse(comments, message.FIND_COMMENT_SUCCESS);
  }

  async findOne(id: string): Promise<GetCommentByIdResponse> {
    const comment = await this.commentRepository.findOne({
      where: { id: id },
      relations: ['product', 'user'],
    });
    if (!comment) {
      throw new NotFoundException(message.FIND_COMMENT_FAIL);
    }
    return this.functionCommentResponse(comment, message.FIND_COMMENT_SUCCESS);
  }

  async update(
    userId: string,
    id: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<UpdateCommentResponse> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['comments'],
    });

    const userComment = user.comments.find((comment) => comment.id === id);

    if (!userComment) {
      throw new NotFoundException(message.FIND_COMMENT_FAIL);
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
    return this.functionCommentResponse(
      userComment,
      message.UPDATE_COMMENT_SUCCESS,
    );
  }

  async remove(userId: string, id: string): Promise<Respond> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['comments'],
    });

    const userComment = user.comments.find((comment) => comment.id === id);
    if (!userComment) {
      throw new NotFoundException(message.FIND_COMMENT_FAIL);
    }
    await this.commentRepository.remove(userComment);

    return {
      message: message.DELETE_COMMENT_SUCCESS,
    };
  }
}
