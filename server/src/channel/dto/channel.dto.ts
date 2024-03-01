import { IsNotEmpty, IsEnum, IsString } from 'class-validator';
import { ChanType } from './enum';

export class CreateChannelDto {
  @IsNotEmpty()
  @IsString()
  chanName: string;
  
  @IsNotEmpty()
  @IsEnum(ChanType)
  chanType: ChanType;
  
  chanPassword?: string;
}

export class JoinChannelDto {
  @IsNotEmpty()
  @IsString()
  chanId: string;

  chanPassword?: string;
}

export class KickUserDto {
  chanId: string;
  targetUserId: string;
}

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  chanId: string;

  @IsString()
  content: string;
}