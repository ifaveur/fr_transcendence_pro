import {
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { logger } from 'src/global-var/global-var.service';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
	constructor(
	) {
		super({});
	}

  handleRequest(err, user, info) {
    if (err || !user) {
		logger('<<< access denied >>>'.red);
		if (err)
			logger('ERR:', err.stack.split('\n')[0], 'ERROR');
		if (user)
			logger('USER:', user, 'ERROR');
		if (info)
			logger('INFO:', info.stack.split('\n')[0], 'ERROR');
    	throw new UnauthorizedException();
    }
    return user;
  }
}

  