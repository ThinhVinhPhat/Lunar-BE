import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { UserReq } from '@app/decorator/user.decorator';
import { User } from '@app/entity';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messageService: MessageService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Find messages by User',
    description: 'Find messages by User',
  })
  @Get('/me')
  getUserMessages(@UserReq() user: User) {
    const id = user.id;
    return this.messageService.getUserMessage(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Find messages by sender and receiver',
    description: 'Find messages by sender and receiver',
  })
  @Get('/:senderId')
  getConversationMessages(
    @UserReq() user: User,
    @Param('senderId') senderId: string,
  ) {
    const id = user.id;
    return this.messageService.getMessagesBetweenUsers(senderId, id);
  }
}
