import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Game, User, PrismaClient } from "@prisma/client";
import * as achievements from './achievements.json';
import { UserService } from "../user/user.service";
import { getUserFromDatabase } from "src/utils/utils";
const prisma = new PrismaClient();

type Achievement = {
	category: string,
	level: number,
	title: string,
	description: string,
	xp: number
}

@Injectable()
export class AchievementsService {
	

	async findAchievement(title: string) {
		return await prisma.achievements.findUnique({
			where: {
				title
			}
		})
	}

    async getUserWithAchievements(username: string) {
		try {
			return await prisma.user.findUnique({
				where: {
					username
				},
				include: {
					achievements: true
				}
			})
		} catch(e) {
			throw new InternalServerErrorException('error retieving achievements from dh!!');
		}
	}

    async giveAchievements(username: string, achievement: Achievement) {
		const user = await getUserFromDatabase(username);
		const ac = await this.findAchievement(achievement.title);
		if (!user || !ac)
			return ;
		await prisma.user.update({
			where: {
				username: user.username,
			}, 
			data: {
				achievements: {
					connect: [{id: ac.id}]
				}
			}
		});
		await prisma.achievements.update({
			where: {
				title: achievement.title
			}, 
			data: {
				users: {
					connect: [{username: user.username}]
				}
			}
		});
	}

    async createAchievement(achievement: any) {
		const ac = await prisma.achievements.findMany();
		const acMap = ac.filter(a => a.title === achievement.title);
		const {xp, ...rest} = achievement;
		if (acMap.length !== 0)
			return ;
		await prisma.achievements.create({
			data: { ...rest}
		});
	}

    async giveWelcome(username: string) {
		try {
			const {achievements: ac} = await this.getUserWithAchievements(username);
			const oldAc = ac.find(a => a.title === 'Welcome')
			if (oldAc)
				return ;
			await this.createAchievement(achievements.achievements.Welcome);
			await this.giveAchievements(username, achievements.achievements.Welcome);
		} catch(e) {
			throw new InternalServerErrorException('error giveWelcome!')
		}
	}

	async giveFirstWin(username: string) {
		try {
			const {achievements: ac} = await this.getUserWithAchievements(username);
			const oldAc = ac.find(a => a.title === 'FirstWin')
			if (oldAc)
				return ;
			await this.createAchievement(achievements.achievements.FirstWin);
			await this.giveAchievements(username, achievements.achievements.FirstWin);
		} catch(e) {
			throw new InternalServerErrorException('error give firstWin!')
		}
	}

	async giveWinStreak(username: string) {
		try {
			const {achievements: ac} = await this.getUserWithAchievements(username);
			const oldAc = ac.find(a => a.title === 'WinStreak')
			if (oldAc)
				return ;
			await this.createAchievement(achievements.achievements.WinStreak);
			await this.giveAchievements(username, achievements.achievements.WinStreak);
		} catch(e) {
			throw new InternalServerErrorException('error give winStreak!')
		}
	}
}
