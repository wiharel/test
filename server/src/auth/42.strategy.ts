import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-42';
import { PrismaClient } from '@prisma/client';
import { UserService } from 'src/user/user.service';
const prisma = new PrismaClient();

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private userService: UserService) {
    super({
      clientID: process.env.FORTYTWO_CLIENT_ID,
      clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
      callbackURL: process.env.FORTYTWO_CALLBACK_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ) {
    console.log("entre")
    const { id, _json } = profile;
    const user = {
      id: id,
      username: _json.login,
      accessToken,
    };
    console.log("on créer le user")
    console.log(user);
    //done(null, user)
    const existingUser = await this.userService.findUserByID(user.id);
    if (existingUser == null)
      return await this.userService.createUser(user);
    else
      return existingUser;
    
  }

  //Etape 02 : si l'authentificaion réussi :
  //stock les données du user dans la session
    serializeUser({ user, done }: { user: any; done: Function; }): void {
        done(null, user.id);
    }

    deserializeUser({ userId, done }: { userId: string; done: Function; }): void {
      this.userService.findUserByID(userId).then(user => {
        done(null, user); // Attache l'utilisateur récupéré à l'objet req
      }).catch(error => done(error));
    }

}