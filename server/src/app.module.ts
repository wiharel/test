import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ChannelModule } from './channel/channel.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { GameModule } from './game/game.module';
import { UserService } from './user/user.service';
import { QrcodeModule } from './qrcode/qrcode.module';
import { FriendsModule } from './friends/friends/friends.module';
import { AchievementsModule } from './achievements/achievements.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, GameModule, QrcodeModule, FriendsModule, AchievementsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
