import { Controller, Post, Param, UseGuards, Req, Body, HttpCode, HttpStatus, Get, Delete, Patch } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('/send-request')
  sendFriendRequest(@Body('senderId') senderId: string, @Body('receiverId') receiverId: string) {
      return this.friendsService.sendFriendRequest(senderId, receiverId);
  }

  @Get('/friend-list/:userId')
  //@UseGuards(AuthGuard('jwt'))
  getFriendList(@Param('userId') userId: string) {
      return this.friendsService.getUserFriends(userId);
  }
  
  @Get('/block-list/:userId')
  getBlockList(@Param('userId') userId: string) {
      return this.friendsService.getUserBlocked(userId);
  }

  @Delete('/decline-request')
  //@UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async declineFriendRequest(@Body('receiverId') receiverId: string, @Body('senderId') senderId: string,) {
    await this.friendsService.declineFriendRequest(senderId, receiverId);
  }

  @Delete('/cancel-friendship')
  //@UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async cancelFrienship(@Body('user1Id') user1Id: string, @Body('user2Id') user2Id: string,) {
    await this.friendsService.cancelFriendship(user1Id, user2Id);
  }

  @Post('/accept-request')
  //@UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  async acceptFriendRequest(@Body('receiverId') senderId: string,@Body('senderId') receiverId: string,) {
    await this.friendsService.acceptFriendRequest(senderId, receiverId);
  }

  @Post('/send')
  //@UseGuards(AuthGuard('jwt'))
  async sendMessage(
    @Body('senderId') senderId: string,
    @Body('receiverId') receiverId: string,
    @Body('content') content: string,
  ) {
    return this.friendsService.sendMessage(senderId, receiverId, content);
  }

  @Get('/dmhistory/:userId1/:userId2')
  //@UseGuards(AuthGuard('jwt'))
  async getMessageHistory(
    @Param('userId1') userId1: string,
    @Param('userId2') userId2: string,
  ) {
    return this.friendsService.getMessageHistory(userId1, userId2);
  }

  @Get('received-requests/:userId')
  //@UseGuards(AuthGuard('jwt'))
  getReceivedFriendRequests(@Param('userId') userId: string) {
    return this.friendsService.getReceivedFriendRequests(userId);
  }

  @Get('sent-requests/:userId')
  //@UseGuards(AuthGuard('jwt'))
  getSentFriendRequests(@Param('userId') userId: string) {
    return this.friendsService.getSentFriendRequests(userId);
  }

  @Post('block')
  //@UseGuards(AuthGuard('jwt'))
	async blockUser(@Body('userId') userId: string, @Body('blockedId') blockedId: string) {
		return this.friendsService.blockUser(userId, blockedId);
	}

	@Patch('unblock')
  //@UseGuards(AuthGuard('jwt'))
	async unblockUser(@Body('userId') userId: string, @Body('blockedId') blockedId: string) {
    console.log(userId, blockedId);
		return this.friendsService.unblockUser(userId, blockedId);
	}
}