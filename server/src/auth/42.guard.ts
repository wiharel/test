import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common'
import { Observable } from 'rxjs';

@Injectable()
export class FortyTwoAuthGuard extends AuthGuard('42') {
    async canActivate(context: ExecutionContext) {
     
        return await super.canActivate(context) as boolean;
    }
}