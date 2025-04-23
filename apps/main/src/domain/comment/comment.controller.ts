import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiOperationDecorator } from '@app/decorator/api-operation.decorator';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@/domain/users/entity/user.entity';
import { Public } from '@app/decorator/public.decorator';
import { FindCommentDTO } from './dto/find-comment.dto';

@Controller('comment')
@ApiTags('Comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperationDecorator({
    summary: 'Create a new comment',
    description: 'Create a new comment',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  @ApiBearerAuth()
  @Post('/:id')
  create(
    @Param('id') productId: string,
    @UploadedFiles() images: Express.Multer.File[],
    @Body() createCommentDto: CreateCommentDto,
    @UserReq() currentUser: User,
  ) {
    const userId = currentUser.id;
    return this.commentService.create(
      userId,
      {
        ...createCommentDto,
        images: images,
      },
      productId,
    );
  }

  @ApiOperationDecorator({
    summary: 'Get all comments by product',
    description: 'Get all comments by product',
  })
  @Public()
  @Get('/get-by-product/:id')
  findAllByProductId(
    @Param('id') productId: string,
    @Query() query: FindCommentDTO,
  ) {
    return this.commentService.findAllByProductId(productId, query);
  }

  @ApiOperationDecorator({
    summary: 'Get all comments by user',
    description: 'Get all comments by user',
  })
  @Get('get-by-user')
  @ApiBearerAuth()
  findAllByUser(@UserReq() currentUser: User, @Query() query: FindCommentDTO) {
    const userId = currentUser.id;
    return this.commentService.findAllByUser(userId, query);
  }

  @ApiOperationDecorator({
    summary: 'Get comment by id',
    description: 'Get comment by id',
  })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentService.findOne(id);
  }

  @ApiOperationDecorator({
    summary: 'Update comment by id',
    description: 'Update comment by id',
  })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  @Patch(':id')
  update(
    @Param('id') id: string,
    @UserReq() currentUser: User,
    @Body() updateCommentDto: UpdateCommentDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    const userId = currentUser.id;
    return this.commentService.update(userId, id, {
      ...updateCommentDto,
      images: images,
    });
  }

  @ApiOperationDecorator({
    summary: 'Delete comment by id',
    description: 'Delete comment by id',
  })
  @ApiBearerAuth()
  @Delete(':id')
  remove(@UserReq() currentUser: User, @Param('id') id: string) {
    const userId = currentUser.id;
    return this.commentService.remove(userId, id);
  }
}
