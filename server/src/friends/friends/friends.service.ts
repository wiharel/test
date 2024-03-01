import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { FriendRequest } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';


@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService, private userService: UserService) {}

  /** DM Hanlers */

  async sendMessage(senderId: string, receiverId: string, content: string) {
    await this.userService.checkId(senderId);
    await this.userService.checkId(receiverId);

    if (!await this.friendExists(senderId, receiverId)) {
      throw new HttpException('Users are not friends.', HttpStatus.BAD_REQUEST);
    }
    return this.prisma.directMessage.create({
      data: {
        senderId,
        receiverId,
        content,
      },
    });
  }

  async getMessageHistory(userId1: string, userId2: string) {
    return this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      orderBy: [
        { sentAt: 'asc' },
        { dmId: 'asc' }
      ],
    });
  }

  
  /** GETTERS */

  async getReceivedFriendRequests(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
      },
      include: {
        sender: true, // Inclure les détails de l'expéditeur
      },
    });
  }

  // Récupérer les demandes d'ami envoyées
  async getSentFriendRequests(userId: string) {
    return this.prisma.friendRequest.findMany({
      where: {
        senderId: userId,
      },
      include: {
        receiver: true, // Inclure les détails du destinataire
      },
    });
  }
  
  async getUserFriends(userId: string) {
    if (this.userService.checkId(userId)){
      // Récupère les amis que l'utilisateur a ajoutés
      const friendsAddedByUser = await this.prisma.user.findUnique({
        where: { userId },
        select: {
          friends: {
            select: {
              friend: {
                select: {
                  userId: true,
                  username: true,
                  userIconPath: true,
                  userStatus: true,
                  displayName: true,
                }
              }
            }
          }
        }
      });
    
      // Récupère les amis qui ont ajouté l'utilisateur
      const friendsWhoAddedUser = await this.prisma.user.findUnique({
        where: { userId },
        select: {
          friendOf: {
            select: {
              user: {
                select: {
                  userId: true,
                  username: true,
                  userIconPath: true,
                  userStatus: true,
                  displayName: true,
                }
              }
            }
          }
        }
      });
    
      // Fusionne et dédoublonne la liste d'amis
      const combinedFriendsList = [
        ...friendsAddedByUser.friends.map(friendship => friendship.friend),
        ...friendsWhoAddedUser.friendOf.map(friendship => friendship.user)
      ];
    
      // Utilise un Set pour éliminer les doublons basés sur l'userId
      const uniqueFriends = Array.from(new Set(combinedFriendsList.map(friend => JSON.stringify(friend))))
        .map(str => JSON.parse(str));
    
      return uniqueFriends;
    }
  }

  async getUserBlocked(userId: string) {
    if (this.userService.checkId(userId)){
      // Retrieve the users blocked by the user
      const usersBlockedByUser = await this.prisma.user.findUnique({
        where: { userId },
        select: {
          blocked: {
            select: {
              blocked: {
                select: {
                  userId: true,
                  username: true,
                  userIconPath: true,
                  userStatus: true,
                  displayName: true,
                }
              }
            },
          }
        }
      });
  
      // Retrieve the users who have blocked the user
      const usersWhoBlockedUser = await this.prisma.user.findUnique({
        where: { userId },
        select: {
          blockedby: {
            select: {
              blocker: {
                select: {
                  userId: true,
                  username: true,
                  userIconPath: true,
                  userStatus: true,
                  displayName: true,
                }
              }
            },
          }
        }
      });
  
      // Merge and deduplicate the blocked users list
      const combinedBlockedList = [
        ...usersBlockedByUser.blocked.map(blockedUser => blockedUser.blocked),
        ...usersWhoBlockedUser.blockedby.map(blockedUser => blockedUser.blocker),
      ];
  
      // Use a Set to eliminate duplicates based on the userId
      const uniqueBlockedUsers = Array.from(new Set(combinedBlockedList.map(user => JSON.stringify(user))))
        .map(str => JSON.parse(str));
  
      return uniqueBlockedUsers;
    }
  }

  async sendFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest> {
    if (await this.userService.checkId(senderId) === await this.userService.checkId(receiverId)) {
      throw new HttpException('You cannot send a friend request to yourself.', HttpStatus.BAD_REQUEST);
    }

    if (await this.friendExists(senderId, receiverId)) {
      throw new HttpException('Users are already friends.', HttpStatus.BAD_REQUEST);
    }

    if (await this.friendRequestPending(senderId, receiverId)) {
      throw new HttpException('You have already sent, or have been sent to, a friend request', HttpStatus.BAD_REQUEST);
    }

    if (await this.isUserBlocked(senderId, receiverId)) {
      throw new HttpException('You have blocked this user', HttpStatus.CONFLICT);
    }

    if (await this.isUserBlocked(receiverId, senderId)) {
      throw new HttpException('This user have blocked you', HttpStatus.FORBIDDEN);
    }
    const friendRequest = await this.prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
      },
    });
    return friendRequest;
  }

    async declineFriendRequest(senderId: string, receiverId: string): Promise<any> {
      // Supprimer la demande d'ami de la base de données
      await this.prisma.friendRequest.deleteMany({
        where: {
          senderId,
          receiverId,
        },
      });
      //check si elle exitste
      //check si sender != receiver
      return { message: 'Friend request declined.' };
    }

    async cancelFriendship(user1Id: string, user2Id: string): Promise<any> {
      // Supprimer la demande d'ami de la base de données
      await this.prisma.userFriends.deleteMany({
        where: {
          OR: [
            {
              AND: [
                { userId: user1Id },
                { friendId: user2Id },
              ],
            },
            {
              AND: [
                { userId: user2Id },
                { friendId: user1Id },
              ],
            },
          ],
        },
      });
      return { message: 'Friendship canceled.' };
    }
  
    async acceptFriendRequest(senderId: string, receiverId: string): Promise<void> {
      if (!await this.friendRequestPending(senderId, receiverId))
      throw new HttpException('The friend Request does not exist', HttpStatus.BAD_REQUEST);

      if (await this.friendExists(senderId, receiverId)) {
        throw new HttpException('Users are already friends.', HttpStatus.BAD_REQUEST);
      }
      //fait toutes les operations et si une echoue, rollback
      await this.prisma.$transaction(async (prisma) => {
        //supprime la friend request
        await this.prisma.friendRequest.deleteMany({
          where: {
            OR: [
              {
                AND: [
                  { senderId: senderId },
                  { receiverId: receiverId },
                ],
              },
              {
                AND: [
                  { senderId: receiverId},
                  { receiverId: senderId }, 
                ],
              },
            ],
          },
        });
  
        // Créer l'amitie
        await prisma.userFriends.create({
          data: {
            userId: senderId,
            friendId: receiverId,
          },
        });
      });
    }


  /** UTILS */

  async friendExists(user1Id: string, user2Id: string): Promise<boolean> {
    // Check if there's an existing friendship where either user1 is the sender and user2 is the receiver or vice versa
    const existingFriendship = await this.prisma.userFriends.findFirst({
      where: {
        OR: [
          {
            AND: [
              { userId: user1Id },
              { friendId: user2Id },
            ],
          },
          {
            AND: [
              { userId: user2Id },
              { friendId: user1Id },
            ],
          },
        ],
      },
    });
    return !!existingFriendship; // Returns true if a friendship exists, false otherwise
  }

  async friendRequestPending(user1Id: string, user2Id: string): Promise<boolean> {
    const pendingRequest = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          {
            AND: [
              { senderId: user1Id },
              { receiverId: user2Id },
            ],
          },
          {
            AND: [
              { senderId: user2Id},
              { receiverId: user1Id }, 
            ],
          },
        ],
      },
    });
  
    return !!pendingRequest; // Renvoie true si une demande est trouvée, sinon false
  }

  async isUserBlocked(blockerId: string, blockedId: string): Promise<boolean> {
    const blockRecord = await this.prisma.userBlock.findFirst({
      where: {
        blockerId: blockerId,
        blockedId: blockedId,
      },
    });
    return !!blockRecord;
  }

  /** BLOCK / UNBLOCK USER (pas forcement un friends)*/
  async blockUser(userId: string, blockedId: string) {
    if (await this.userService.checkId(userId) === await this.userService.checkId(blockedId)) {
      throw new HttpException('You cannot block yourself.', HttpStatus.BAD_REQUEST);
    }
    await this.cancelFriendship(userId, blockedId);

    return this.prisma.userBlock.create({
      data: {
        blockerId: userId,
        blockedId: blockedId,
      },
    });
  }

  async unblockUser(userId: string, blockedUserId: string) {
    return this.prisma.userBlock.deleteMany({
      where: {
        blockerId: userId,
        blockedId: blockedUserId,
      },
    });
  }
}