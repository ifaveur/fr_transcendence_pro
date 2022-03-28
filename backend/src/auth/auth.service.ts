import { Injectable,
	 NotFoundException, 
		Res,
		Inject,
		forwardRef, 
		Req} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto, UserDTO } from 'src/user/user/dto/create-user.dto';
import { UserService } from 'src/user/user/user.service';
import { logger } from 'src/global-var/global-var.service';
import { status2FA } from 'src/global-var/global-var.service';

@Injectable()
export class AuthService {
		constructor(
			private jwtService: JwtService,
			@Inject(forwardRef(() => UserService))
			private userService: UserService,
		) {}

	async fromTokenToLogin(token: string) : Promise<string> {
		const decoded = this.jwtService.decode(token);
		if (decoded && decoded['login']){
			return decoded['login'];
		} else {
			throw NotFoundException;
		}
	}

	verifyToken(token: string)  {
		try 
		{
			this.jwtService.verify(token)
			return true;
		}
		catch 
		{
			return false;
		}

	}

	async fromTokenToStatus2fa(token: string) : Promise<status2FA> {
		const decoded = this.jwtService.decode(token);
		if (decoded && decoded['status2fa']){
			return decoded['status2fa'];
		} else {
			throw NotFoundException;
		}
	}

	async login42(data: CreateUserDto, @Res() res) {
		try {
			await this.userService.findByLogin(data.login);
		} catch (error) {
			await this.userService.insert(data);
		}
		const user: UserDTO =  await this.userService.findByLogin(data.login);
		try {
			var token;
			if (user.is2FA)
			{
				token = this.jwtService.sign({ login: user.login, status2fa: status2FA.ValidationPending}); 
			}
			else
			{
				token = this.jwtService.sign({ login: user.login, status2fa: status2FA.NotActivate}); 
			}
			res.cookie('access_token', token, { httpOnly: true, });
		} catch (error) {
			logger('error', 'ERROR');
			return { user };
		}
		return { user };
	}

	async createValidCookie(@Req() req, @Res({ passthrough: true }) res) : Promise<void>
	{
		var user_login!:string;
		user_login = await this.fromTokenToLogin(req.cookies['access_token'])
		res.clearCookie('access_token');

		var token = this.jwtService.sign({ login: user_login, status2fa: status2FA.Activate});

		res.cookie('access_token', token, { httpOnly: true});
	}
	
	async getmyToken(@Res() res) {
		return { access_token : res.cookies['access_token'] };
	}
}
