import {
	Injectable,
    Inject,
    forwardRef,
	NotFoundException, 
    Req} from '@nestjs/common'
import { UserEntity } from 'src/db/entities/user.entity'
import { CreateUserDto, CreateUserNameDto } from './dto/create-user.dto'
import { LoggerService } from 'src/logger/logger.service'
import { AuthService } from 'src/auth/auth.service';
import { domain, logger } from 'src/global-var/global-var.service';
import { SocketService } from '../socket/socket.service';
import { userStatus } from 'src/db/entities/user.entity';
import { StatService } from '../stat/stat.service';
import { Not } from 'typeorm';

@Injectable()
export class UserService {
	constructor(
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,
		private socketService: SocketService,
		private statService: StatService,
	) {}

    async insert(userDetails: CreateUserDto ) {
		logger(userDetails);
        const user: UserEntity = UserEntity.create();
        
        if (await this.findByName(userDetails.login))
        {
            user.name = userDetails.login;
            while (await this.findByName(user.name))
            {
                 user.name = user.name + "*";
            }
        } else {
            user.name = userDetails.login;
        }
        user.login = userDetails.login;
        user.email = userDetails.email;
        user.image_url = userDetails.image_url;
        await user.save();

        this.statService.init(user.id);

        return (user);
    }

    async insertNameOnly(userDetails: CreateUserNameDto ) {
        const user: UserEntity = UserEntity.create();
        user.name = userDetails.name;
        await user.save();
        return (user);
    }

    async insertCode2fa(code: string, req) {
        var userID!:number;

        userID = (await this.getMe(req)).id
        const user: UserEntity = await UserEntity.findOne({where: {id: userID}})
        user.code2fa = code;
        await user.save();
        return (user);
    }

    async getCode2Fa(req) : Promise<string>
    {
        var userID!:number;

        userID = (await this.getMe(req)).id
        const user: UserEntity = await UserEntity.findOne({where: {id: userID}});

        return user.code2fa
    }

    async cleanCode2fa(req) {
        var userID!:number;

        userID = (await this.getMe(req)).id
        const user: UserEntity = await UserEntity.findOne({where: {id: userID}})
        user.code2fa = '';
        await user.save();
        return (user);
    }

    async getAllUsers(): Promise<UserEntity[]> {
        return await UserEntity.find();
    }

    async getUsers(): Promise<UserEntity[]> {
		const users: UserEntity[] = await UserEntity.find();
		if (users) {
			return users;
		} else {
			throw new NotFoundException('No users in DB');
		}
	}

    async getUserById(userID: number): Promise<UserEntity> {
        return await UserEntity.findOne({where: {id: userID}});
    }

    async getUserByName(name: string) {
        return await UserEntity.findOne({where: {name: name}});
    }

    async setNewUserName(userID: number, userDetails: CreateUserNameDto) {
        const user: UserEntity = await UserEntity.findOne({where: {id: userID}});
        user.name = userDetails.name;
        await user.save()
        return user
    }

    async set2fa(@Req() req, set2fa: {bool:boolean}) {
        var userID!:number;

        userID = (await this.getMe(req)).id
        const user: UserEntity = await UserEntity.findOne({where: {id: userID}});
        user.is2FA = set2fa.bool;
        await user.save();
        return user
    }

    async setNewName(@Req() req,  set_new_name: { name:string}) {
        var userID!:number;

        userID = (await this.getMe(req)).id
        const user: UserEntity = await UserEntity.findOne({where: {id: userID}});
        user.name = set_new_name.name;
        await user.save();
        return user
    }

    async setImgUrl(@Req() req, img_url:string) {
        var userID!:number;

        userID = (await this.getMe(req)).id
        const user: UserEntity = await UserEntity.findOne({where: {id: userID}});

        user.image_url = domain + "/" + img_url;
        await user.save();
        return user;
    }

    async findByLogin(login: string) {
		return await UserEntity.findOneOrFail({
			where: {
				login: login,
			},
		});
	}

    async findByName(name: string) {
		try { await UserEntity.findOneOrFail({
			where: {
				name: name,
			},
		});
        return true;
    }
    catch {
        return false;
    }
	}

    async findByEmail(email: string): Promise<UserEntity> {
		return await UserEntity.findOneOrFail({
			where: {
				email: email,
			},
		});
	}

    async getMe(req)
    {
        try {
            const login = await this.authService.fromTokenToLogin(req.cookies['access_token']);
            const user = await this.findByLogin(login);
            return user;
        }
        catch
        {
            return null;
        }
    }
 
	async updateStatus(ID: number, newStatus: userStatus) {
		var user = await this.getUserById(ID)
        logger(user.name.cyan, '[', newStatus.green, ']')
		user.status = newStatus

		await user.save()
	}

	async getAllUsersByStatus(status: userStatus) {
		const users: UserEntity[] = await UserEntity.find(
			{
				where:
				{
					status : status
				}
			}
		)
		return users
	}

	async getAllUsersByNOTStatus(status: userStatus) {
		const users: UserEntity[] = await UserEntity.find(
			{
				where:
				{
					status : Not(status)
				}
			}
		)
		return users
	}

	async getAllStatusUsers() {
		return {
			online: await this.getAllUsersByStatus(userStatus.ONLINE),
			ingame: await this.getAllUsersByStatus(userStatus.INGAME),
			gamestartpage: await this.getAllUsersByStatus(userStatus.GAMESTARTPAGE),
			spectator: await this.getAllUsersByStatus(userStatus.SPECTATOR),
            matchmaking: await this.getAllUsersByStatus(userStatus.MATCHMAKING),
			offline: await this.getAllUsersByStatus(userStatus.OFFLINE)
		}
	}

	async resetAllStatus(): Promise<void> {
		var users = await this.getAllUsersByNOTStatus(userStatus.OFFLINE)
		for (const user of users) {
			user.status = userStatus.OFFLINE
			await user.save()
		}
	}
}