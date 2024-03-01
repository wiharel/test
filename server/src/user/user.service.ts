import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient, Game, User } from '@prisma/client';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserCreateDto } from './dto';
import { unlinkSync } from 'fs';
import * as sizeOf from "image-size"
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(
    private jwtService: JwtService,
    ) {}
  private readonly prisma = new PrismaClient();

  async changeDisplayName(req: any, updated: string) {
    const userCookie = req.cookies.access_token;
    const decoded = this.jwtService.decode(userCookie);

    return this.prisma.user.update({
      where: { username: decoded.username },
      data: { displayName: updated },
    });
  }

  async findUserByID(userId : string): Promise <User | null>{
    if (!userId) 
      throw new Error('The id is not correct.');
    const user = await this.prisma.user.findUnique({
      where: {
        userId: userId 
      },
    });
    if (!user)
      return null;
    return user;
  }


  async findUser(username: string){
    if (!username)
      throw new NotFoundException('User not found');
    return await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      include : {
        achievements: true,
      }
    });
  }

  async findUserMore(username: string){
    if (!username)
      throw new NotFoundException('User not found');
    return await this.prisma.user.findUnique({
      where: {
        username: username,
      },
        include: {
          friends: true,
        },
    });
  }

  async createMatch(p1: string, p2: string, score1: number, score2: number){
    const user1 = await this.findUserByID(p1);
    const user2 = await this.findUserByID(p2);
    const winnerId = score1 > score2 ? user1.userId : score2 > score1 ? user2.userId : null;


    console.log(user1.username, "vs", user2.username);

    if (!user1 || !user2)
      throw new NotFoundException('User not inserted');
    const match = await this.prisma.game.create({
      data:{
        leftPlayer : { connect: { userId: user1.userId } },
        rightPlayer : { connect: { userId: user2.userId } },
        rightPlayerScore: score1,
        leftPlayerScore: score2,
        winner: winnerId ? { connect: { userId: winnerId } } : undefined,
      }
    });

    if (winnerId){
      const winner = await this.prisma.user.findUnique({
        where: { userId: winnerId },
        include: {gamesWon: true},
      });
      // if (winner && winner.gamesWon.length === 1){
      //   await this.achievementsService.giveFirstWin(winner.username);
      // }
    }
  }

  async updateUserQrCode(username: string, url: string){
    try{
      return await this.prisma.user.update({
        where: {
          username: username,
        },
        data: {
          otpauth_url: url,
        },
      });
    }catch(e){
      return 'error';
    }
  }


  async getUserAchievements(req: any){
    const decode = this.jwtService.decode(req.cookies.access_token);
    const user = await this.prisma.user.findUnique({
      where: {
        username: decode.username,
      },
      include: {
        achievements: true,
      },
    });
    return user?.achievements
  }


  async matchHistory(req: any){
    const decoded = this.jwtService.decode(req.cookies.access_token);
    const user = await this.findUser(decoded.username);
    if (!user)
      throw new NotFoundException('User not found');
    const rank = await this.prisma.user.findMany({
      include: {
        gamesWon: true,
      },
    });

    const number = await this.prisma.user.findUnique({
        where: { username: user.username },
        select: {
          gamesWon: true, 
          gameHistoryAsLeftPlayer: true,
          gameHistoryAsRightPlayer: true,
        }
      });
    const games = await this.prisma.game.findMany({
      where: {
        OR: [
          {
            leftPlayerId: user.userId,
          },
          {
            rightPlayerId: user.userId,
          },
        ],
      },
      include: {
        winner: true,
        rightPlayer: true,
        leftPlayer: true,
      },
    });

    return {
      rank: rank.sort((a, b) => b.gamesWon.length - a.gamesWon.length).findIndex((u) => u.username === user.username) + 1,
      matchHistory: games,
      gamesWon: number.gamesWon.length,
      gamesPlayed: number.gameHistoryAsLeftPlayer.length + number.gameHistoryAsRightPlayer.length,
      gamesLost: (number.gameHistoryAsLeftPlayer.length + number.gameHistoryAsRightPlayer.length) - number.gamesWon.length,
    };
  }

  async matchHistoryPlayer(userId: string){
    const user = await this.findUserByID(userId);
    if (!user)
      throw new NotFoundException('User not found');
    const rank = await this.prisma.user.findMany({
      include: {
        gamesWon: true,
      },
    });

    const number = await this.prisma.user.findUnique({
        where: { username: user.username },
        select: {
          gamesWon: true, 
          gameHistoryAsLeftPlayer: true,
          gameHistoryAsRightPlayer: true,
        }
      });
    const games = await this.prisma.game.findMany({
      where: {
        OR: [
          {
            leftPlayerId: user.userId,
          },
          {
            rightPlayerId: user.userId,
          },
        ],
      },
      include: {
        winner: true,
        rightPlayer: true,
        leftPlayer: true,
      },
    });

    return {
      rank: rank.sort((a, b) => b.gamesWon.length - a.gamesWon.length).findIndex((u) => u.username === user.username) + 1,
      matchHistory: games,
      gamesWon: number.gamesWon.length,
      gamesPlayed: number.gameHistoryAsLeftPlayer.length + number.gameHistoryAsRightPlayer.length,
      gamesLost: (number.gameHistoryAsLeftPlayer.length + number.gameHistoryAsRightPlayer.length) - number.gamesWon.length,
    };
  }

  async getFriends(username: string){
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      include: {
        friends: {
          include: {
            friend: true,
          },
        },
        sentFriendRequests: {
          include: {
            receiver: true,
          },
        },
        blocked: {
          include: {
            blocker: true,
          },
        },
      },
    });

    return{
      user: user,
    };
  }

  async createUser(dto : UserCreateDto) {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          username: dto.username,
          userId: dto.id,
          userStatus: 'online'
        },
      });
      return (newUser);
    } catch (error) {
      if (error.code === 'P2002') {
        const target = (error?.meta?.target || []) as string[];
        //httpsexception 
        if (target.includes('userId')) {
          throw new Error('User already registered');
        }
        if (target.includes('username')) {
          throw new Error('Username already exists');
        }
      };
      throw (error);
    }
  }

  async checkId(userId : string) : Promise<string> {
    if (userId == null) {
      throw new HttpException('The user ID is null', HttpStatus.BAD_REQUEST);
    }
    // else if (Number.isInteger(Number(userId)))
    //   throw new HttpException('The user ID is not a number', HttpStatus.BAD_REQUEST);
    const user = await this.findUserByID(userId);
    if (!user) {
      throw new HttpException('No user with this ID was found', HttpStatus.NOT_FOUND);
    }
    return userId;
  }

  async searchUser(searchTerm: string){
    return this.prisma.user.findMany({
      where: {
        displayName: {
          contains: searchTerm,
        },
      },
      include: {
        friends: true,
      },
    });
  }

  async editProfil(req: any, body: any){
    const decoded = this.jwtService.decode(req.cookies.access_token);
    const user = await this.findUserByID(decoded.userId);
    
    return this.prisma.user.update({
      where: {
        username: user.username,
      },
      data: {
        displayName: body.displayName,
        twofactor: body.twofactor,
      },
    });
  }


  async updateUserWinStreak(user: User){
    return this.prisma.user.update({
      where: {
        username: user.username,
      },
      data: {
        winStreak: user.winStreak,
      },
    });
  }


  async deletePreviousImage(username: string, category: string) {
		let provider: string;
		const user = await this.prisma.user.findUnique({
			where: {
				username
			}
		})
		provider = user.userIconPath.split('/')[2];
    console.log(provider);
		if (provider !== `${process.env.CALLBACK_URL}:3001/uploads/avatar/default.${category}.png`)
		{
			const oldImage = user.userIconPath.split('/')[5];
      const filePath = path.join(__dirname, 'uploads', category, `${oldImage}`);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error(`Error deleting file ${filePath}:`, err);
      }
    }
	}

	async changeUserCatalogue(username: string , file: Express.Multer.File, category: string) {
		const ext = extname(file.originalname);
		let path = `${process.env.CALLBACK_URL}:3001/uploads/avatar/${username}.${category}${ext}`;
		try {
			sizeOf.imageSize(file.path);
		} catch (e) {
			unlinkSync(`uploads/${category}/${username}.${category}${ext}`);
			path = `${process.env.CALLBACK_URL}:3001/uploads/avatar/default.${category}.${ext}`;
		}
		await this.prisma.user.update({
			where: {
				username
			},
			data: {
				userIconPath: path
			}
		});
		return path;
	}
}



