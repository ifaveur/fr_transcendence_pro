import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	Req,
	Res,
	UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserNameDto } from "./dto/create-user.dto";
import { AuthService } from "src/auth/auth.service";

import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserEntity } from "src/db/entities/user.entity";
import { logger } from "src/global-var/global-var.service";

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
		private authService: AuthService
	) {}

    @Post("name")
    createUserName(@Body() user: CreateUserNameDto) {
        return this.userService.insertNameOnly(user);
    }

    @Post("2fa")
    set2fa(@Req() req, @Body() set2fa: { bool:boolean}) {
        return this.userService.set2fa(req, set2fa);
    }

    @Post("newname")
    async setNewName(@Req() req, @Body() setNewName: { name:string}) {
        
        var user: UserEntity|boolean;
        if ((user = await this.userService.findByName(setNewName.name))=== false)
        {
            return this.userService.setNewName(req, setNewName);
        }
        else
        {
            return false;
        }
    }

    @Post("newUsername/:id")
    updateUserName(@Param('id') id, @Body() userName: CreateUserNameDto) {
		return this.userService.setNewUserName(id, userName);
    }

    @Get("id/:id")
    getUserById(@Param('id') id: number) {
        return this.userService.getUserById(id);
    }

    @Get("username")
    async getMyUsername(@Req() req, @Res({ passthrough: true }) res) : Promise<string> {
		var login:string;
            await this.authService.fromTokenToLogin(req.cookies['access_token'])
            .catch(func => login = "NoName")
            .then(Login =>  login = Login)
        return login;
	}

    @Get("name/:name")
	getUserByName(@Param('name') name: string) {
		return this.userService.getUserByName(name);
	}


	@Get("me")
    async getMe(@Req() req, @Res({ passthrough: true }) res) : Promise<UserEntity> {
		try {
			const login = await this.authService.fromTokenToLogin(req.cookies['access_token']);
			const user = await this.userService.findByLogin(login);
			return user;
		}
		catch {
			return null;
		}
	}
}


/*
This controller is needed to be without authguard.
This just respond if the user is connected or not.
*/
@Controller('logged')
export class UserLoggedController {
    constructor(
		private authService: AuthService,
		private userService: UserService,

	) {}

    @Get("")
	async findMe(@Req() req, @Res({ passthrough: true }) res)  : Promise<boolean> {
        var login:string;
        if (this.authService.verifyToken(req.cookies['access_token']) == false)
        {
            res.clearCookie('access_token')
            return (false)
        }
        await this.authService.fromTokenToLogin(req.cookies['access_token'])
        .catch(func => login = "NoName")
        .then(Login =>  login = Login)
		try {
			await this.userService.findByLogin(login);
		} catch {
			return false;
		}

        if (login != "NoName") {
            return true;

		}
        return false;
	}
}
