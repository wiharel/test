import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { ChannelController } from './channel.controller';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  providers: [ChannelService],
  controllers: [ChannelController],
  exports: [ChannelService]
})
export class ChannelModule {}