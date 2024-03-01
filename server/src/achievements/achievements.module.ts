import { Module, forwardRef } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { UserModule } from 'src/user/user.module';

@Module({
    // imports: [forwardRef(() => UserModule)],
    providers: [AchievementsService],
    exports: [AchievementsService],
})
export class AchievementsModule {}
