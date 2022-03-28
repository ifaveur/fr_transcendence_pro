import { Injectable } from "@nestjs/common";
import { delay } from "rxjs";
import { BlackListEntity } from "src/db/entities/blacklist.entity";
import { BlockUserDto } from "./dto/blockuser.dto";
import { logger } from "src/global-var/global-var.service";
import { In, Not } from "typeorm";
import { UserEntity } from "src/db/entities/user.entity";
import { UserInChatDetailsDto } from "src/chat/chat_user/dto/userjoinchat.dto";

@Injectable()
export class BlackListService {
	constructor(
	) {}
	
    async insert(blockUser: BlockUserDto) {
        const list: BlackListEntity = BlackListEntity.create();
        list.iduser = blockUser.idUser;
        list.iduserblocked = blockUser.idUserToBlock;
        await list.save();
    }

    async delete(blockUser: BlockUserDto) {
        await BlackListEntity.delete({
                iduser: blockUser.idUser,
                iduserblocked: blockUser.idUserToBlock,
        })
        return await BlackListEntity.find({where : {iduser: blockUser.idUser}});
    }

	async getBlockedList(idUser: number) {
		const test: BlackListEntity[] = await BlackListEntity.find({where: {
			iduser: idUser,
			}
		});
		var idBlockedUser:number[] = [];
		test.forEach(e => {
			idBlockedUser.push(e.iduserblocked);
		});
		const result: UserEntity[] = await UserEntity.find({
			where: {
				id: In(idBlockedUser)
			}
		})
		return result;
	}

	async getNonBlockedList(idUser: number) {
		const test: BlackListEntity[] = await BlackListEntity.find({where: {
			iduser: idUser,
			}
		});
		var idBlockedUser:number[] = [];
		test.forEach(e => {
			idBlockedUser.push(e.iduserblocked);
		});
		idBlockedUser.push(idUser)
		const result: UserEntity[] = await UserEntity.find({
			where: {
				id: Not(In(idBlockedUser))
			}
		})
		return result;
	}

	async getBlockersList(idUser: number) {
		const blockers: BlackListEntity[] = await BlackListEntity.find({where: {
			iduserblocked: idUser,
			}
		});
		var blockersID:number[] = [];
		blockers.forEach(e => {
			blockersID.push(e.iduser);
		});
		const result: UserEntity[] = await UserEntity.find({
			where: {
				id: In(blockersID)
			}
		})
		return result;
	}

	async getBlockedandNonBlockedList(userID: number) {
		return ({
			blocked: await this.getBlockedList(userID),
			nonblocked: await this.getNonBlockedList(userID)
		})
	}

	async isBlocked(victimID: number, criminalID: number) {
		const blockers = await this.getBlockersList(victimID)
		if (blockers && blockers.length) {
			for (const blocker of blockers) {
				if (blocker.id === criminalID)
					return true;
			}
		}
		return false;
	}

}