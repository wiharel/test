import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
// import { AchievementsService } from '../achievements/achievements.service';
import { AchievementsModule } from 'src/achievements/achievements.module';
import { AchievementsService } from 'src/achievements/achievements.service';

@Module({
  imports: [forwardRef(() => AuthModule), forwardRef(() => AchievementsModule)],
  controllers: [UserController],
  providers: [UserService, JwtService],
  exports: [UserService],
})
export class UserModule {}
