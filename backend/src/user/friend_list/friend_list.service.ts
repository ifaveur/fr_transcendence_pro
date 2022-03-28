import { Injectable } from "@nestjs/common";
import { FriendListEntity } from "src/db/entities/friendlist.entity";
import { LoggerService } from "src/logger/logger.service";
import { NewFriendDto } from "./dto/friend_list.dto";
import { logger } from "src/global-var/global-var.service";
import { In, Not } from "typeorm";
import { UserEntity } from "src/db/entities/user.entity";

@Injectable()
export class FriendListService {
    constructor(
        
    ) {}

    async insert(addFriend: NewFriendDto, friendBack = 0) {
        const newFriend: FriendListEntity = FriendListEntity.create();
        newFriend.iduser = addFriend.idUser;
        newFriend.idfrienduser = addFriend.idAddUser;
        await newFriend.save();
		if (!friendBack)
			this.insert({ idUser: addFriend.idAddUser, idAddUser: addFriend.idUser }, 1)
    }

    async delete(friend: NewFriendDto, deleteBack = 0) {
        await FriendListEntity.delete({
            iduser: friend.idUser,
            idfrienduser: friend.idAddUser,
        })
		if (!deleteBack)
			this.delete({ idUser: friend.idAddUser, idAddUser: friend.idUser }, 1)
    }

    async getFriendList(idUser: number) {
		const test: FriendListEntity[] = await FriendListEntity.find({where: {
			iduser: idUser,
			}
		});
		var idFriendUser:number[] = [];
		test.forEach(e => {
			idFriendUser.push(e.idfrienduser);
		});
		const result: UserEntity[] = await UserEntity.find({
			where: {
				id: In(idFriendUser)
			}
		})
		return result;
	}

	async getNonFriendList(idUser: number) {
		const test: FriendListEntity[] = await FriendListEntity.find({where: {
			iduser: idUser,
			}
		});
		var idFriendUser:number[] = [];
		test.forEach(e => {
			idFriendUser.push(e.idfrienduser);
		});
		idFriendUser.push(idUser)
		const result: UserEntity[] = await UserEntity.find({
			where: {
				id: Not(In(idFriendUser))
			}
		})
		return result;
	}

	async getFriendandNonFriendList(userID: number) {
		return ({
			friend: await this.getFriendList(userID),
			nonfriend: await this.getNonFriendList(userID)
		})
	}

	async areFriends(iduser1: number, iduser2: number) {
		return  await FriendListEntity.findOne(
		{
			where: {
				iduser: iduser1,
				idfrienduser: iduser2
			}
		})
	}
}