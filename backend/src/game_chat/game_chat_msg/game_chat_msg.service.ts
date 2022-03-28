import { Injectable } from "@nestjs/common";
import { GameChatMsgEntity } from "src/db/entities/gamechatmsg.entity";
import { LoggerService } from "src/logger/logger.service";
import { GameMsgDto } from "./dto/game_chat_msg.dto";
import { logger } from "src/global-var/global-var.service";


@Injectable()
export class GameChatMsgService {
    constructor(
	) {}

    async insert(data: GameMsgDto) {
        const msg : GameChatMsgEntity = GameChatMsgEntity.create();
        msg.idchatgame = data.idChat;
        msg.iduser = data.idUser;
        msg.message = data.message;
        await msg.save();
        return await GameChatMsgEntity.findOne({
            relations: ["user"],
            where: {
                id: msg.id,
            }
        });
    }

    async delete(id: number) {
        await GameChatMsgEntity.delete({
            id: id
        })
    }

    async getMessageFromChat(id: number) {
      return await GameChatMsgEntity.find({
            relations: ["user"],
            where: {
                idchatgame: id,
            },
            order: {
                updatedat: "ASC"
            }
        })
    }
}