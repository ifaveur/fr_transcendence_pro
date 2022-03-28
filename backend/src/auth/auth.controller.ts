import { Controller,
	Res,
	Get,
	UseGuards,
	Req,
	Redirect,
	NotFoundException,
	ArgumentsHost,
	Param,
	Query
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Auth42Guard } from 'src/auth/guards/auth42.guard';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user/user.service';

import { logger } from 'src/global-var/global-var.service';
import { Auth42Strategy } from './guards/auth42.strategy';

@Controller('auth')
export class AuthController {
	constructor(
		private authService: AuthService,
		private Auth42Strategy: Auth42Strategy
	) {}

	@UseGuards(Auth42Guard)
	@Get('login42')
	async login42(@Req() req, @Res({ passthrough: true }) res) {
		const user = await this.authService.login42(req.user, res);
		logger(req.user.login, '[', 'logged in '.green, ']');
		return user;
	}

	@Get('logout')
	async logout(@Res({ passthrough: true }) res, @Req() req) {
		var login:string  = await this.authService.fromTokenToLogin(req.cookies['access_token']);
		logger(' '+login, '[', 'logged out'.red, ']');
		await this.authService.fromTokenToLogin(req.cookies['access_token']).catch(func => logger("catch")).then(func => login = "NoName");
		res.clearCookie('access_token');
		return;
	}

}
