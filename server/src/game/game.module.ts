import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/user.service';
import { AchievementsModule } from 'src/achievements/achievements.module';

@Module({
  imports: [JwtModule, AuthModule, UserModule, AchievementsModule],
  providers: [GameService, GameGateway, UserService]
})
export class GameModule {}
