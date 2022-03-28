import {
	Injectable,
	Logger } from "@nestjs/common";
import { ChatEntity } from "src/db/entities/chat.entity";
import { ChatUserEntity, chatUserStatus } from "src/db/entities/chatuser.entity";
import { In, Not } from "typeorm";
import { UserInChatDetailsDto, UserInChatDto, UserJoinChatDto } from "./dto/userjoinchat.dto";
import { Cron } from '@nestjs/schedule';
import { userWarnDto } from "./dto/userwarn.dto";
import { logger } from "src/global-var/global-var.service";
import { UserEntity, userStatus } from "src/db/entities/user.entity";
import { ChatAdminEntity } from "src/db/entities/chatadmin.entity";
import { FriendListEntity } from "src/db/entities/friendlist.entity";
import { BlackListEntity } from "src/db/entities/blacklist.entity";

@Injectable()
export class ChatUserService { 

	constructor(
	) {}  

	async insert(userJoinChat: UserJoinChatDto) {
		const chatUser: ChatUserEntity = ChatUserEntity.create();
		chatUser.userid = userJoinChat.idUser;
		chatUser.chatid = userJoinChat.idChat;
		await chatUser.save();
		return (chatUser);
	}

	async deleteuserfromchat(userJoinChat: UserJoinChatDto) {
		await ChatUserEntity.delete({
			userid: userJoinChat.idUser,
			chatid: userJoinChat.idChat
		})
	}

	async banUser(data: userWarnDto) {
		const chatUser: ChatUserEntity = await ChatUserEntity.findOne({
			where: {
				userid: data.idUser,
				chatid: data.idChat
			}
		});
		chatUser.status = chatUserStatus.BAN;
		chatUser.time = data.time;
		await chatUser.save();
	}

	async muteUser(data: userWarnDto) {
		const chatUser: ChatUserEntity = await ChatUserEntity.findOne({
			where: {
				userid: data.idUser,
				chatid: data.idChat
			}
		});
		chatUser.status = chatUserStatus.MUTE;
		chatUser.time = data.time;
		await chatUser.save();
	}

	async clearStatus(user: { idUser: number, idChat: number }) {
		const chatUser: ChatUserEntity = await ChatUserEntity.findOne({
			where: {
				userid: user.idUser,
				chatid: user.idChat
			}
		});

		logger('cleaning userid', chatUser.userid, 'from status [', chatUser.status.rainbow, ']');

		chatUser.status = chatUserStatus.NONE;
		chatUser.time = 0;
		await chatUser.save();
	}

	async getUserList(idChat: number): Promise<ChatUserEntity[]> {
		const res =  await ChatUserEntity.find({
			select: ["user", "status", "time", "updatedat"],
			where: {
				chatid: idChat,
			},
			relations: ["user"],
		});
		return res
	}

	async getUsersNotInThisChat(chatID: number) {
		const users = await this.getUserList(chatID)
		
		const usersID: number[] = []
		for (const user of users)
			usersID.push(user.userid)

		const res =  await UserEntity.find({
			where: {
				id: Not(In(usersID)),
			}
		})
		return res
	}

	async getChatList(idUser: number): Promise<ChatEntity[]> {
		const test: ChatUserEntity[] = await ChatUserEntity.find({select: ["chatid"], where: {
			userid: idUser,
			status: Not(chatUserStatus.BAN)
			}
		});
		var idChat:number[] = [];
		test.forEach(e => {
			idChat.push(e.chatid);
		});
		const result: ChatEntity[] = await ChatEntity.find({
			where: {
				id: In(idChat)
			}
		})
		return result;
		
	}

	async getAvailableChat(idUser: number) {
		const test: ChatUserEntity[] = await ChatUserEntity.find({select: ["chatid"], where: {
			userid: idUser,
			}
		});
		var idChat:number[] = [];
		test.forEach(e => {
			idChat.push(e.chatid);
		});
		const result: ChatEntity[] = await ChatEntity.find({
			where: {
				id: Not(In(idChat)),
				isprivate: false
			}
		})
		return result;
	}

	async getUserById(userID: number) {
        return await ChatUserEntity.findOne({where: {userid: userID}});
    }

	async getUserInfoFromChat(id: number): Promise<UserInChatDto[]> {
		const data: UserInChatDto[] = await ChatUserEntity.createQueryBuilder("cu")
		.leftJoinAndSelect(UserEntity, "u", "u.id = cu.userid")
		.where({
			chatid: id,
		})
		.select([
			"u.id as id",
			"u.name as name",
			"u.login as login",
			"u.image_url as path",
		])
		.getRawMany();

		return (data);
	}

	async getListBanMute() {
		return await ChatUserEntity.find({
			where: {
				status: In([chatUserStatus.BAN, chatUserStatus.MUTE]) 
			}
		})
	}

	async getUserDetailFromChat(id: number):Promise<UserInChatDetailsDto[]> {
		const data:UserInChatDetailsDto[] = await ChatUserEntity.createQueryBuilder("cu")
		.leftJoinAndSelect(UserEntity, 'u', 'u.id = cu.userid')
		.select([
			"u.id as id",
			"u.name as name",
			"u.login as login",
			"u.image_url as path",
			"cu.chatid as chatid",
			"cu.status as status",
			"cu.time as time",
			"cu.updatedat as date",
		])
		.addSelect((subQuery) => {
			return subQuery.select('COUNT(*)')
			.from(ChatAdminEntity, 'ca')
			.where("ca.userid = cu.userid AND ca.chatid = cu.chatid");
		}, 'isadmin')
		.addSelect((subQuery) => {
			return subQuery.select('COUNT(*)')
			.from(ChatAdminEntity, 'ca')
			.where("ca.userid = cu.userid AND ca.chatid = cu.chatid AND ca.istempo = false");
		}, 'issuperadmin')
		.where({
			chatid: id,
		})
		.getRawMany();

		return (data);
	}

	async isMuted(userID: number, chatID: number) {
		const chatUser = await ChatUserEntity.findOne({
			where: {
				userid: userID,
				chatid: chatID
			},
		});
		if (chatUser != undefined
			&& chatUser.status === chatUserStatus.MUTE)
			return true
		return false
	}
	async isBanned(userID: number, chatID: number) {
		const chatUser = await ChatUserEntity.findOne({
			where: {
				userid: userID,
				chatid: chatID
			},
		});
		if (chatUser != undefined
			&& chatUser.status === chatUserStatus.BAN)
			return true
		return false
	}
}