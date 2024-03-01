import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-42';
import * as speakeasy from 'speakeasy';
import * as fs from 'fs';
import { getUserFromDatabase, isTwoFactorEnabled } from 'src/utils/utils';
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { UserService } from 'src/user/user.service';
const prisma = new PrismaClient();

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private userService: UserService) {}



  async login(user: any, res: any) {
    const payload = { ...user };
    await prisma.user.update({
      where: { username: user.username },
      data: { userStatus: 'online' },
    });
    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(payload , {expiresIn: '7d'})
    };
  }


  async NoFactor(req: Request, res: Response) {
    const token = req.cookies.access_token;
    const info = this.jwtService.decode(token) as any;
    
    const updatedUser = await prisma.user.update({
      where: {
        userId: info.userId,
      },
      data: {
        twofactor: false,
        registered: true
      },
      });
      return updatedUser;
  }


  async logout(res: Response, req: any) {
    const decoded = this.jwtService.decode(req.cookies.access_token);
    await prisma.user.update({
      where: { username: decoded.username },
      data: { userStatus: 'offline' },
    });
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return res.status(200).send('Logged out');
  }


  async generateTwoFactorAuthsecret() {
    const secret = speakeasy.generateSecret({
      name: 'ft-transcendence',
      options: {
        encoding: 'base32',
      },
    });
    return secret;
  }

  async enableTwoFactor(req: Request, res: Response) {
    const token = req.cookies.access_token;
    const info = this.jwtService.decode(token) as any;
    
    const secret= await this.generateTwoFactorAuthsecret();
    const url = secret.otpauth_url;
    const updatedUser = await prisma.user.update({
      where: {
        userId: info.userId,
      },
      data: {
        otpauth_secret: secret.base32,
        otpauth_url: url,
        twofactor: true,
        registered: true
      },
      });
      return updatedUser.otpauth_url;
  }
  
  async verifyTwoFactorAuthCode(req: Request, userInput: string, res: Response) {
    const token = req.cookies.access_token;
    const decodedToken = this.jwtService.decode(token) as any;
    const user = await this.userService.findUserByID(decodedToken.userId);
    if (user) {
      const url = user.otpauth_secret;
      const isVerified = speakeasy.totp.verify({
        secret: url,
        encoding: 'base32',
        token: userInput,
      });
      if (isVerified)
      {
        const updatedUser = await prisma.user.update({
          where: {
            userId: user.userId,
          },
          data: {
            otpauth_verified: true,
          },
          });
          res.send({isVerified, user: user.username, displayName: user.displayName});
      }
      else {
        res.send({isVerified, user: user.username, displayName: user.displayName});
      }
    } 
  }
}