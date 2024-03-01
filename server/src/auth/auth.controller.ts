// auth.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Res,
  Req,
  Post,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response, Request } from 'express';
import { getUserFromDatabase, isTwoFactorEnabled } from 'src/utils/utils';
const cookieParser = require('cookie-parser');
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import *  as qrcode from 'qrcode';
import { JwtGuard } from './jwt.guard';
import { AchievementsService } from 'src/achievements/achievements.service';



/** A FAIRE */
//
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private userService: UserService, private achievementService: AchievementsService) {}

  @Get('42')
  @UseGuards(AuthGuard('42'))
  async protectedRoute() {}

  
  
  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  async callback(@Res() res: Response, @Req() req: Request & { user: any }) {
    // Handles the 42 callback
    console.log("hum")
    try {
      const existingUser = await this.userService.findUserByID(req.user.userId);
      if (!existingUser)
      {
        throw new Error("User not found, connexion not allowed.");
      }
      const jwt = await this.authService.login(existingUser, res);
      await this.achievementService.giveWelcome(existingUser.username);
      res.cookie('access_token', jwt.access_token,  { httpOnly: true });
      res.cookie('refresh_token', jwt.refresh_token,  { httpOnly: true });
      console.log('test', existingUser.registered);
      //res.cookie('username', existingUser.username);
      console.log(existingUser.twofactor, existingUser.registered, existingUser.otpauth_verified);
      try {
        if (existingUser.twofactor){
          if (existingUser.registered && existingUser.otpauth_verified == false){
            res.redirect(`${process.env.CALLBACK_URL}:3000/qrcode`);
          }
          else if (existingUser.registered){
            res.redirect(`${process.env.CALLBACK_URL}:3000/code-verification`);
          } else 
            res.redirect(`${process.env.CALLBACK_URL}:3000/qrcode`);
        }
        else if (existingUser.twofactor == false && existingUser.registered == true) //pas la premiere connexion et twofactor disabled
          res.redirect(`${process.env.CALLBACK_URL}:3000/mapselect`); //à creer dans le front
        else
          res.redirect(`${process.env.CALLBACK_URL}:3000/EnableAuth`);
    } catch (error) {
      console.error(error);
    }
      }
    catch (error) {
      console.error(error);
        res.redirect(`${process.env.CALLBACK_URL}:3000`);
    }
  }

  //code verification renvois vers :


  @Post('verify-2fa')
  //@UseGuards(AuthGuard('jwt'))
  verifyTwoFactorAuthCode(
    @Req() req: Request,
    @Body('userInput') userInput: string,
    @Res() res: Response,
  ) {
    console.log(userInput);
    return this.authService.verifyTwoFactorAuthCode(req, userInput, res);
  }


  //enable auth si oui
  @Post('enable-2fa')
  @UseGuards(JwtGuard)
  async enable2fa(@Res() res: Response, @Req() req: Request) {
    console.log("je passe")
    const url = await this.authService.enableTwoFactor(req, res);
    res.status(200).json({url});
  }

  @Post('no-2fa')
  @UseGuards(JwtGuard)
  async no2fa(@Res() res: Response, @Req() req: Request) {
    console.log("je passe")
    const url = await this.authService.NoFactor(req, res);
    res.status(200).json({url});
  }
  //enable auth si non 


  @Post('logout')
  @UseGuards(JwtGuard)
  async logoutUser(@Res() res: Response, @Req() req: any) {
    // res.redirect(`${process.env.CALLBACK_URL}:3000`);
    await this.authService.logout(res, req);
  }
}