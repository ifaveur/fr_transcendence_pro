import { Injectable } from "@nestjs/common";
import { ChatMsgService } from 'src/chat/chat_msg/chat_msg.service';
import { ChatEntity } from "src/db/entities/chat.entity";
import { CreateChatDto } from "./dto/create-chat.dto";
import { logger } from "src/global-var/global-var.service";
import * as bcrypt from 'bcrypt';




@Injectable()
export class ChatService {

	constructor(
		private chat_msg: ChatMsgService,
	) {}

	saltOrRounds = 12;

    async insert(chatInfo: CreateChatDto) {
        const chat: ChatEntity = ChatEntity.create();
        chat.name = chatInfo.name;
        chat.islocked = chatInfo.islocked;
		chat.isprivate = chatInfo.isprivate
		if (chat.islocked)
        	chat.password = await this.hashPassword(chatInfo.password);
        await chat.save();
        return (chat);
    }

    async delete(id: number) {
        await ChatEntity.delete({
            id: id,
        })
    }

    async getAllChats(): Promise<ChatEntity[]> {
        return await ChatEntity.find();
    }

	async getChatById(ID: number) {
        return await ChatEntity.findOne({where: {id: ID}});
    }

	async deleteAll() {}

	async changePassword(chatID: number, newPassword: string) {
		const chat = await this.getChatById(chatID)
		chat.islocked = true
		chat.password = await this.hashPassword(newPassword)
		await chat.save()
		return chat
	}

	async disablePassword(chatID: number) {
		const chat = await this.getChatById(chatID)
		if (chat) {
			chat.islocked = false
			chat.password = "";
			await chat.save()
		}
		return chat
	}

	async switchRoomPrivacy(chatID: number, state: boolean) {
		const chat = await this.getChatById(chatID)
		chat.isprivate = state
		await chat.save()
		return chat
	}

	async hashPassword(password: string) {
		return await bcrypt.hash(password, this.saltOrRounds);
	}

	async isMatchPassword(password: string, hash: string) {
		var result: boolean =  await bcrypt.compare(password, hash);
		return result;
	}

	async changeName(chatID: number, newName: string) {
		var chat = await this.getChatById(chatID)
		chat.name = newName
		await chat.save()
		return chat
	}


}