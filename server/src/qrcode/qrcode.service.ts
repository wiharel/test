import { Injectable, NotFoundException } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import { UserService } from 'src/user/user.service';
import { getUserFromDatabase, twoFactorOn } from 'src/utils/utils';

@Injectable()
export class QrcodeService {
    constructor (
        private readonly userService: UserService,
    ) {}

    async getHistory(req: any){
        return this.userService.matchHistory(req);
    }

    async getUserAchievements(req: any){
      return this.userService.getUserAchievements(req);
    }
}
