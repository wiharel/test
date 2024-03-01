import { CanActivate, ExecutionContext, Injectable, createParamDecorator } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Observable } from "rxjs";

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
}