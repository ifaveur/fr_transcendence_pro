import { Injectable } from "@nestjs/common";
import { ChatMsgEntity } from "src/db/entities/chatmsg.entity";
import { CreateChatMsgDto } from "./dto/create-chat_msg.dto";
import { logger } from "src/global-var/global-var.service";

@Injectable()
export class ChatMsgService {
	constructor(
	) {}

    async insert(msgInfo: CreateChatMsgDto) : Promise<ChatMsgEntity> {
        const chatmsg: ChatMsgEntity = ChatMsgEntity.create();
        chatmsg.message = msgInfo.message;
        chatmsg.userid = msgInfo.idUser;
        chatmsg.chatid =  msgInfo.idChat;
        await chatmsg.save();
        return await ChatMsgEntity.findOne({
            relations: ["user"],
            where: {
                id: chatmsg.id,
            }
        });
    }

    async getAllMessageFromChat(chatID: number): Promise<ChatMsgEntity[]> {
        return await ChatMsgEntity.find({
            select: ["message", "createdat", "user"],
            relations: ["user"],
            where: {
                chatid: chatID
            },
            order: { createdat: "ASC"}
        });
    }

    async deleteAllMessageFromChat(chatID: number) {
		await ChatMsgEntity.delete({
            chatid: chatID,
        })
	}


}