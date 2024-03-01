import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import {Strategy, ExtractJwt} from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
const prisma = new PrismaClient();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: JwtStrategy.extractJWT,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  private static extractJWT(req: Request): string | null {
    if (
        req.cookies &&
        req.cookies.access_token &&
        req.cookies.access_token.length > 0
    ) {
        return req.cookies.access_token;
    }
    return null;
}

  async validate(payload: any) {
    const user = await this.userService.findUserByID(payload.userId);
    if (!user) {
      throw new Error("L'utilisateur n'a pas été enregistré.");
    }
    //on attache le payload à req
    return payload;
  }

}