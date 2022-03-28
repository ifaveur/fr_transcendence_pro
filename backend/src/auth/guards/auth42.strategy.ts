import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import axios from 'axios';
import { logger } from 'src/global-var/global-var.service';


@Injectable()
export class Auth42Strategy extends PassportStrategy(Strategy, 'Auth42') {

	constructor(
		) {

		super({
            authorizationURL: process.env.AUTH_URL,
			tokenURL: process.env.TOKEN_URL,
			clientID: process.env.CLIENT_ID,
			clientSecret: process.env.CLIENT_SECRET,
			callbackURL: process.env.CALLBCK_URL,
			scope: 'public',
			proxy: true
		});
	}

	// https://axios-http.com/docs/res_schema
	// validate() called only AFTER successful validation of super()
	async validate( access_token: string ): Promise<any> {
        const { data } = await axios.get('https://api.intra.42.fr/v2/me', {
			headers: {
				'Authorization': 'Bearer ' + access_token
			}
		});
		const user = { login: data.login, email: data.email, image_url: data.image_url };
		return user;
    }
}