import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { QrcodeController } from './qrcode.controller';
import { QrcodeService } from './qrcode.service';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [UserModule,
      JwtModule.register({
          secret: process.env.JWT_SECRET
      })
  ],
  controllers: [QrcodeController],
  providers: [QrcodeService, AuthService],
  exports: []
})

export class QrcodeModule {}
