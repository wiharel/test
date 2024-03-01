// channel.service.ts
import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChannelDto, JoinChannelDto, KickUserDto } from './dto';
import { ChanType } from './dto/enum';
import { SendMessageDto } from './dto/channel.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { connect } from 'http2';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService, private userService: UserService) {}


  /**------------------------------------------------------------------------------------------- */
  /**                                CREATE / DELETE                                            */
  /**----------------------------------------------------------------------------------------- */
  async createChannel(ownerId: string, chan: CreateChannelDto) {
    await this.userService.checkId(ownerId);

    /*
    const existingChannel = await this.prisma.channel.findUnique({
        where: {
            chanName: chan.chanName,
        },
    });

    if (existingChannel) {
        throw new HttpException(`Channel with name "${chan.chanName}" already exists`, HttpStatus.BAD_REQUEST);
    }*/

    let pass = null;
    //console.log(chan.chanPassword);
    if (chan.chanType == "private") {
        if (chan.chanPassword == null) {
            throw new HttpException('Password missing for private channel', HttpStatus.BAD_REQUEST);
        } else if (chan.chanPassword.length < 3){
          throw new HttpException('Password must have at least 3 characters', HttpStatus.BAD_REQUEST);
        } else {
            const salt = await bcrypt.genSalt();
            pass = await bcrypt.hash(chan.chanPassword, salt);
        }
    }

    const data: any = {
      ownerId: ownerId,
      chanName: chan.chanName,
      chanType: chan.chanType,
      members: {
          connect: { userId: ownerId },
      },
      administrators: {
          connect: { userId: ownerId },
      },
    };

    if (pass != null) {
        data.chanPassword = pass;
    }

    const channel = await this.prisma.channel.create({ data });

    return channel;
  }

  async delete(userId: string, chanId: string) {
    await this.userService.checkId(userId);
    await this.checkId(chanId);

    const channel = await this.prisma.channel.findUnique({
      where: {
        chanId: chanId,
      },
    });
    if(userId == channel.ownerId) {
      await this.prisma.channel.delete({
        where: { chanId: chanId },
      });
    }
    else {
      throw new HttpException('The user is not the owner an cannot delete de Channel', HttpStatus.UNAUTHORIZED);
    }
  }

  /**------------------------------------------------------------------------------------------- */
  /**                                JOIN / LEAVE                                               */
  /**----------------------------------------------------------------------------------------- */

  async joinChannel(userId: string, chan : JoinChannelDto) {
    await this.userService.checkId(userId);
    
    const channel = await this.prisma.channel.findUnique({
      where: { chanId: chan.chanId },
      include: {
        invites: true,
        banned: true,
      },
    });

    if (!channel) {
      throw new HttpException('Channel not found.', HttpStatus.NOT_FOUND);
    }

    // Check that user isn't banned from channel
		if (channel.banned.find((banned) => banned.userId === userId)) {
			throw new HttpException('You are banned from this channel', HttpStatus.UNAUTHORIZED);
		}

    //check si le user n'est pas deja dedans
    if (this.isMember(chan.chanId, userId)) {
      throw new HttpException('You are already a member of this channel', HttpStatus.BAD_REQUEST);
    }

    // Check selon le type de channel
    switch (channel.chanType) {
      case ChanType.Public:
        return this.addUserToChannel(userId, chan.chanId);
      case ChanType.Private:
        if ((chan.chanPassword && channel.chanPassword === channel.chanPassword)) {
        } else {
          throw new HttpException('This channel is private and needs a password', HttpStatus.UNAUTHORIZED);
        }
      case ChanType.Protected:
        const isInvited = channel.invites.some(invite => invite.userId === userId);
        if (isInvited) {
          return this.addUserToChannel(userId, chan.chanId);
        } else {
          throw new HttpException('You must be invited to join this channel', HttpStatus.UNAUTHORIZED);
        }
      default:
        throw new HttpException('Channel type is not recognized', HttpStatus.NOT_FOUND);
    }
  }

  async leaveChannel(userId: string, chanId: string){
    await this.userService.checkId(userId);
    await this.checkId(chanId);

    // Vérifier si l'utilisateur est membre du canal
    const channel = await this.prisma.channel.findUnique({
      where: {
        chanId: chanId,
      },
      include: {
        members: true,
      },
    });
  
    if (!channel) {
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    }
  
    if (!this.isMember(chanId, userId)) {
      throw new HttpException('The user is not a member', HttpStatus.BAD_REQUEST);
    }
  
    // Retirer l'utilisateur du canal
    await this.prisma.channel.update({
      where: {
        chanId: chanId,
      },
      data: {
        members: {
          disconnect: {
            userId: userId,
          },
        },
      },
    });

    if (this.isAdmin(chanId, userId)) {
      await this.prisma.channel.update({
        where: {
          chanId: chanId,
        },
        data: {
          administrators: {
            disconnect: {
              userId: userId,
            },
          },
        },
      });
    }

    if(userId == channel.ownerId)
    {
      await this.prisma.channel.update({
        where: { chanId: channel.chanId },
        data: {
          owner: null,
        },
      });
    }
    const updatedChannel = await this.prisma.channel.findUnique({
      where: { chanId: channel.chanId },
      include: { members: true },
    });
  
    if (updatedChannel && updatedChannel.members.length === 0) {
      await this.prisma.channel.delete({
        where: { chanId: channel.chanId },
      });
    }
  }

  private async addUserToChannel(userId: string, channelId: string) {
    return this.prisma.channel.update({
      where: { chanId: channelId },
      data: {
        members: {
          connect: { userId: userId },
        },
      },
    });
  }


  /**------------------------------------------------------------------------------------------- */
  /**                                KICK                                                       */
  /**----------------------------------------------------------------------------------------- */
  async kickUserFromChannel(adminUserId: string, chan: KickUserDto) {
    await this.userService.checkId(adminUserId);
    await this.userService.checkId(chan.targetUserId);
    await this.checkId(chan.chanId);

    //récuperer la channel 
    const channel = await this.prisma.channel.findUnique({
      where: { chanId: chan.chanId },
    });
    if (!channel) {
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    }


    if (adminUserId == chan.targetUserId){
      throw new HttpException('You cannot kick yourself', HttpStatus.UNAUTHORIZED);
    }
    //check the user is admin
    if (!this.isAdmin(chan.chanId, adminUserId)) {
      throw new HttpException('You are not an administrator of this channel', HttpStatus.UNAUTHORIZED);
    }

    // check if the user is a member
    if (!this.isMember(chan.chanId, chan.targetUserId)) {
      throw new HttpException('The target user is not a member of this channel', HttpStatus.UNAUTHORIZED);
    }

    //check si la target n'est pas admin
    if (this.isAdmin(chan.chanId, chan.targetUserId)) {
      throw new HttpException('An admin cannot be kicked', HttpStatus.FORBIDDEN);
    }

    //vérifier qu'il n'est pas owner
    if (channel.ownerId === chan.targetUserId) {
      throw new HttpException('An owner cannot be kicked', HttpStatus.FORBIDDEN);
    }

    // Retirer l'utilisateur du canal
    return this.prisma.channel.update({
      where: { chanId: chan.chanId },
      data: {
        members: {
          disconnect: { userId: chan.targetUserId }
        },
      },
    });
  }

  /**------------------------------------------------------------------------------------------- */
  /**                                SEND A MSG TO THE CHANNEL                                  */
  /**----------------------------------------------------------------------------------------- */

  async sendMessageToChannel(userId: string, dto: SendMessageDto) {
    await this.userService.checkId(userId);
    await this.checkId(dto.chanId);

    const channel = await this.prisma.channel.findUnique({
      where: {
        chanId: dto.chanId,
      },
      include: {
        members: true,
        banned: true,
        muted: true,
      },
    });
    // Vérifier si l'utilisateur est membre du canal
    if (!this.isMember(dto.chanId, userId)) {
      throw new HttpException('You are not a member of this channel', HttpStatus.UNAUTHORIZED);
    }

    // Vérifier si l'utilisateur est muet dans le canal
    if (channel.muted.some(mutedUser => mutedUser.userId === userId)) {
     throw new  HttpException('You are muted in this channel', HttpStatus.UNAUTHORIZED);
    }

    // Envoyer le message
    return this.prisma.channelMessage.create({
      data: {
        content: dto.content,
        senderId: userId,
        channelId: dto.chanId,
      },
    });
  }


  /**------------------------------------------------------------------------------------------- */
  /**                                ADD / UNBAN                                                */
  /**----------------------------------------------------------------------------------------- */

  async banUser(adminUserId: string, chan: KickUserDto) {
    await this.userService.checkId(adminUserId);
    await this.userService.checkId(chan.targetUserId);
    await this.checkId(chan.chanId);

    //récuperer la channel 
    const channel = await this.prisma.channel.findUnique({
      where: { chanId: chan.chanId },
    });
    if (!channel) {
      throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
    }


    if (adminUserId == chan.targetUserId){
      throw new HttpException('You cannot ban yourself', HttpStatus.UNAUTHORIZED);
    }
    //check the user is admin
    if (!this.isAdmin(chan.chanId, adminUserId)) {
      throw new HttpException('You are not an administrator of this channel', HttpStatus.UNAUTHORIZED);
    }

    // check if the user is a member
    if (!this.isMember(chan.chanId, chan.targetUserId)) {
      throw new HttpException('The target user is not a member of this channel', HttpStatus.UNAUTHORIZED);
    }

    //check si la target n'est pas admin et le user pas owner
    if (this.isAdmin(chan.chanId, chan.targetUserId) && !(channel.ownerId === chan.targetUserId)) {
      throw new HttpException('An admin cannot be banned if you are not owner', HttpStatus.FORBIDDEN);
    }

    //vérifier qu'il n'est pas owner
    if (channel.ownerId === chan.targetUserId) {
      throw new HttpException('An owner cannot be banned', HttpStatus.FORBIDDEN);
    }

    return await this.prisma.channel.update({
      where: { chanId: channel.chanId },
      data: {
        banned: {
          connect: {userId: chan.targetUserId}
        },
        members: {
          disconnect: { userId: chan.targetUserId }
        },
      },
    })

  }
  /**------------------------------------------------------------------------------------------- */
  /**                                GETTERS                                                    */
  /**----------------------------------------------------------------------------------------- */

  async getUserChannels(userId: string) {
    return this.prisma.user.findUnique({
      where: { userId },
      include: {
        channelsMembership: true,
        channelsBannishement: true,
        channelsInvitations: true,
        channelsAdmins: true,
        channelOwned: true,
      },
    });
  }

  async getChannelMessages(chanId: string) {
    return this.prisma.channel.findUnique({
      where: { chanId },
      include: {
        messages: true, // Assurez-vous que cela corresponde à la relation dans votre modèle
      },
    });
  }

  async getChannelMembers(chanId: string) {
    return this.prisma.channel.findUnique({
      where: { chanId },
      include: {
        members: true, // Utilise la relation 'members' définie dans votre modèle Prisma
      },
    });
  }

  async getBannedUsers(chanId: string) {
    return this.prisma.channel.findUnique({
      where: { chanId },
      include: {
        banned: true, // Assurez-vous que cela correspond à votre modèle et à la relation pour les utilisateurs bannis
      },
    });
  }

  async getMutedUsers(chanId: string) {
    return this.prisma.channel.findUnique({
        where: { chanId },
        include: {
            muted: true,
        },
    });
  }


  /**------------------------------------------------------------------------------------------- */
  /**                                CHECKERS                                                   */
  /**----------------------------------------------------------------------------------------- */
  async isAdmin(chanId: string, userId: string) {
    const channel = await this.prisma.channel.findFirst({
      where: {
        AND: [
          { chanId: chanId },
          { members: { some: { userId: userId } } },
          { administrators: { some: { userId: userId } } },
        ],
      },
    });
    return channel;
  }

  async isMember(chanId: string, userId: string){
    const channel = await this.prisma.channel.findFirst({
      where: {
        AND: [
          { chanId: chanId },
          { members: { some: { userId: userId } } },
        ],
      },
    });
    return channel;
  }
  
  async checkChannel(chanId) {
    const channel = await this.prisma.channel.findUnique({
      where: { chanId }});

    if (!channel) {

      throw new NotFoundException(`Channel with ID ${chanId} not found`);
    }
  }

  async checkId(chanId: string) {
    if (!chanId) {
      throw new HttpException('The channel ID is null', HttpStatus.BAD_REQUEST);
    }
    else if (!Number.isInteger(Number(chanId)))
      throw new HttpException('The channel ID is not a number', HttpStatus.BAD_REQUEST);
    const chan = await this.prisma.channel.findUnique({ where: { chanId: chanId } });
    if (!chan) {
      throw new HttpException('No user with this ID was found', HttpStatus.NOT_FOUND);
    }
  }

  async isOwner(chanId: string, userId: string){
    // Recherchez le channel par son chanId
    const channel = await this.prisma.channel.findUnique({
      where: { chanId },
    });

    // Lancez une exception si le channel n'existe pas
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${chanId} not found`);
    }

    // Comparez l'ownerId du channel avec l'userId fourni
    return channel.ownerId === userId;
  }
}