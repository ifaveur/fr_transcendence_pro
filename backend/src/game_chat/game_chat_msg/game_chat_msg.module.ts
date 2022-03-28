import { Module } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { GameChatMsgController } from "./game_chat_msg.controller";
import { GameChatMsgService } from "./game_chat_msg.service";

@Module({
    imports: [],
    controllers: [GameChatMsgController],
    providers: [
        GameChatMsgService,
        LoggerService
    ]
})
export class GameChatMsgModule {
    
}