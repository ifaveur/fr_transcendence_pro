import { Injectable } from "@nestjs/common";
import { GameChatEntity } from "src/db/entities/gamechat.entity";
import { GameChatMsgEntity } from "src/db/entities/gamechatmsg.entity";
import { logger } from "src/global-var/global-var.service";

@Injectable()
export class GameChatService {
    constructor(
	) {}

    async create(idGame: number) {
        const chat: GameChatEntity = GameChatEntity.create();
        chat.idgame = idGame;
        await chat.save();
        return chat;
    }

    async getChatId(idGame: number) {
        return await GameChatEntity.findOne({where: {idgame: idGame}});
    }

    async deleteChatbyGame(idGame: number) {
        const id: number = (await this.getChatId(idGame)).id;
        this.deleteChatbyid(id);
    }

    async deleteChatbyid(idchat: number) {
        await GameChatMsgEntity.delete({
            idchatgame: idchat,
        })
        GameChatEntity.delete({
            id: idchat,
        })
    }

    async deleteAllChats() {
        await GameChatMsgEntity.delete({})
        GameChatEntity.delete({})
    }
}