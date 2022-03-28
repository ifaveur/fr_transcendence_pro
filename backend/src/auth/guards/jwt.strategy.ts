import {
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { UserService } from 'src/user/user/user.service';
import { UserDTO } from 'src/user/user/dto/create-user.dto';
import { logger } from 'src/global-var/global-var.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly userService: UserService,
	) {
		super({
			jwtFromRequest: (req) => {
				if (!req || !req.cookies) {
					logger('return null', 'ERROR');
					return null;
				}
				return req.cookies['access_token'];
			},
			ignoreExpiration: false,
			secretOrKey: process.env.JWT_SECRET,
		});
	}
  
	async validate(payload: any): Promise<UserDTO> {
		try {
			return await this.userService.findByLogin(payload.login);
		}
		catch {
    		throw new UnauthorizedException();
		}
	}
}
