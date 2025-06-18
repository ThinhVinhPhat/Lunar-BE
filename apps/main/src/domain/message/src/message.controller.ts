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
    summary: 'Find User Detail',
    description: 'Find User Detail',
  })
  @Get('/:senderId')
  getMe(@UserReq() user: User, @Param('senderId') senderId: string) {
    const id = user.id;
    return this.messageService.getMessagesBetweenUsers(senderId, id);
  }
}
