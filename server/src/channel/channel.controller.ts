// channel.controller.ts
import { Controller, Post, Body, Request, UseGuards, Get, Param, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ChannelService } from './channel.service';
import { CreateChannelDto, JoinChannelDto, KickUserDto } from './dto';
import { JwtGuard } from 'src/auth/jwt.guard';


/**--------------------------------------------------------------------------------- */
// POST create --------------> Done
// POST join  --------------->
@Controller('channels')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Post('create')
  @UseGuards(JwtGuard)
  async createChannel(@Req() req, @Body() createChannelDto: CreateChannelDto) {
    const ownerId = req.user.userId;
    return this.channelService.createChannel(ownerId, createChannelDto);
  }

  @Post('join')
  @UseGuards(JwtGuard) // Assurez-vous que seul un utilisateur authentifié peut rejoindre un canal
  async joinChannel(@Req() req, @Body() joinChannelDto: JoinChannelDto) {
    const userId = req.user.userId;
    return this.channelService.joinChannel(userId, joinChannelDto);
  }



  @Post(':channelId/kick')
  @UseGuards(JwtGuard)
  async kickUserFromChannel(@Req() req, @Body() kickUserDto: KickUserDto) {
    const adminUserId = req.user.userId;
    return this.channelService.kickUserFromChannel(adminUserId, kickUserDto);
  }





  
  @Get('channel/:id')
  getUserChannels(@Param('id') userId: string) {
    return this.channelService.getUserChannels(userId);
  }

  @Get(':chanId/messages')
  getChannelMessages(@Param('chanId') chanId: string) {
    return this.channelService.getChannelMessages(chanId);
  }

  @Get(':chanId/members')
  getChannelMembers(@Param('chanId') chanId: string) {
    return this.channelService.getChannelMembers(chanId);
  }

  @Get(':chanId/banned')
  getBannedUsers(@Param('chanId') chanId: string) {
    return this.channelService.getBannedUsers(chanId);
  }

  @Get(':chanId/muted')
  getMutedUsers(@Param('chanId') chanId: string) {
      return this.channelService.getMutedUsers(chanId);
  }

  @Get(':chanId/is-admin/:userId')
  async isUserAdmin(@Param('chanId') chanId: string, @Param('userId') userId: string) {
      return this.channelService.isAdmin(chanId, userId);
  }

  //@Get(':chanId/muted/:userId')
  //async isUserMuted(@Param('chanId') chanId: string, @Param('userId') userId: string) {
  //    return this.channelService.isMuted(chanId, userId);
  //}
}