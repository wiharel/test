import { Controller, Get, Post, Put, Req, Body, UseGuards, Query, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Response, Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { JwtGuard } from 'src/auth/jwt.guard';
import { saveAvatarStorage } from './saveAvatar';
import { extname } from 'path';

@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService, private readonly jwtService: JwtService) {}

  @UseGuards(JwtGuard)
  @Post('changeDisplayName')
  async changeDisplayName(
    @Req() req: any,
    @Body('displayName') displayName: string,
  ) {
    return this.UserService.changeDisplayName(req, displayName);
  }

  @UseGuards(JwtGuard)
  @Get('profil')
  async checkProfile(@Req() req: any) {
    const decoded = this.jwtService.decode(req.cookies.access_token);
    return this.UserService.findUser(decoded.username);
  }

  @UseGuards(JwtGuard)
  @Get('profilMore')
  async checkProfileMore(@Req() req: any) {
    const decoded = this.jwtService.decode(req.cookies.access_token);
    return this.UserService.findUserMore(decoded.username);
  }

  @UseGuards(JwtGuard)
  @Get('friends')
  async getFriends(@Req() req: any) {
    const decoded = this.jwtService.decode(req.cookies.access_token);
    return this.UserService.getFriends(decoded.username);
  }

  @Get('search')
  async searchUsers(@Query('q') searchTerm: string) {
    return this.UserService.searchUser(searchTerm);
  }

  @UseGuards(JwtGuard)
  @Post('edit')
  async editProfile(@Req() req: any, @Body() body: any) {
    return this.UserService.editProfil(req, body);
  }

  @UseGuards(JwtGuard)
  @Post('profil/avatar')
  @UseInterceptors(FileInterceptor('avatar', {
    storage: diskStorage({
      destination: './uploads/avatar',
      filename: (req: any, file, cb) => {
        const ext = extname(file.originalname);
        const filename = `${req.user.username}.avatar${ext}`
        cb(null, filename);
      }
    })
  }))
  async postUserAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file){
      return ('No file');
    }
    const decoded = this.jwtService.decode(req.cookies.access_token);
    const user = await this.UserService.findUserByID(decoded.userId);
    if (file) {
      const type = file.mimetype.split('/')[0];
      console.log(type);
      if (type !== 'image') {
        return ('Invalid file type');
      }
      else {
        await this.UserService.deletePreviousImage(user.username, 'avatar');
        return await this.UserService.changeUserCatalogue(user.username, file, 'avatar');
      }
    }
  }

  @UseGuards(JwtGuard)
  @Post('matchHistory')
  async getMatchHistory(@Body('userId') userId: string) {
    return this.UserService.matchHistoryPlayer(userId);
  }
}
