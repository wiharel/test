import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Response } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, '2fa') {
  constructor(private userService: UserService) {
    super({
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: "25a1bb371c2bc078c97f14348b55bc3f55cf6ed7c545a876b5eaab3dae88ec11",
    });
  }

  async validate(payload: any, res: Response) {
      const user = await this.userService.findUserByID(payload.sub);
      if (!user)
        throw new Error("L'utilisateur n'a pas été enregistré.");
      if (user.twofactor && !payload.twoFactorAuthenticated)
        throw new Error("2FA requis mais pas complété.");
  }
}