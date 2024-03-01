import { Body, Controller,Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, response } from 'express';
import { QrcodeService } from './qrcode.service';
import { AuthGuard } from '@nestjs/passport';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { AuthService } from 'src/auth/auth.service';
import { getUserFromDatabase } from 'src/utils/utils';
import { UserService } from 'src/user/user.service';
import { get } from 'http';

@Controller('qr')
export class QrcodeController {
    constructor (
        private readonly QrcodeService: QrcodeService,
        private readonly authService: AuthService,
    ){}

    @Post('history')
    async getMatchHistory(@Req() req: any, @Res() res: Response){
        const history = await this.QrcodeService.getHistory(req);
        res.send(history);
    }

    @Post('achievements')
    async getAchievements(@Req() req: any, @Res() res: Response){
        const achievements = await this.QrcodeService.getUserAchievements(req);
        res.send(achievements);
    }

}
