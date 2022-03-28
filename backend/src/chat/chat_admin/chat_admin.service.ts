import { Injectable } from "@nestjs/common";
import { ChatAdminEntity } from "src/db/entities/chatadmin.entity";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { logger } from "src/global-var/global-var.service";

@Injectable()
export class ChatAdminService {
	constructor(
	) {}

	async insert(newAdmin: CreateAdminDto, isSuperAdmin = false) {
		const admin: ChatAdminEntity = ChatAdminEntity.create();
		admin.userid = newAdmin.idUser;
		admin.chatid = newAdmin.idChat;
		if (isSuperAdmin === true)
			admin.istempo = false
		await admin.save();
		return (admin);
	}

	async getAdminForChat(chatID: number): Promise<ChatAdminEntity[]> {
		return await ChatAdminEntity.find({
			where: {
				chatid: chatID
			},
			relations: ["user"]
		})
	}

	async getAdminForUser(userID: number): Promise<ChatAdminEntity[]> {
		return await ChatAdminEntity.find({
			where: {
				userid: userID
			},
			relations: ["chat"]
		})
	}
	
	async isAdmin(userID: number, chatID: number) {
		const admin = await ChatAdminEntity.findOne({
			where: {
				userid: userID,
				chatid: chatID
			},
		})
		if (admin != undefined)
			return true
		return false
	}

	async isSuperAdmin(userID: number, chatID: number) {
		const supadmin = await ChatAdminEntity.findOne({
			where: {
				userid: userID,
				chatid: chatID,
				istempo: false
			},
		})
		if (supadmin != undefined)
			return true
		return false
	}


	

	async deleteAdmin(createAdminDto: CreateAdminDto) {
		await ChatAdminEntity.delete({
			userid: createAdminDto.idUser,
			chatid: createAdminDto.idChat
		})
	}

}