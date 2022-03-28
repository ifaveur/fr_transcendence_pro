import { Module } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { GameChatController } from "./game_chat.controller";
import { GameChatService } from "./game_chat.service";


@Module({
    imports: [],
    controllers: [GameChatController],
    providers: [
        GameChatService,
        LoggerService
    ]
})
export class GameChatModule {
    
}