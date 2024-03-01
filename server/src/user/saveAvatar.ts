
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';

export const saveAvatarStorage = {
	  storage: diskStorage({
		destination: './uploads/avatar',
		filename: (req: any, file, cb) => {
		  const ext = extname(file.originalname);
		  const filename = `${req.user.username}.avatar${ext}`
		  cb(null, filename);
		}
	  }),
	  async fileFilter(req: any, file: Express.Multer.File, callback: Function) {
		const type = file.mimetype.split('/')[0];
		if (type !== 'image')
		  callback(null, false);
	  },
  }