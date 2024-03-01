// auth.module.ts
import { Module, forwardRef} from '@nestjs/common';
import { AuthService} from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from 'src/user/user.module';
import { FortyTwoStrategy } from './42.strategy';
import { Jwt2faStrategy } from './2fa.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AchievementsModule } from 'src/achievements/achievements.module';

@Module({
  imports: [
    AchievementsModule,
    PassportModule,
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy, Jwt2faStrategy, JwtStrategy],
  exports: [JwtModule],
})
export class AuthModule {}