import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { GameMsgDto } from "./dto/game_chat_msg.dto";
import { GameChatMsgService } from "./game_chat_msg.service";

@UseGuards(JwtGuard)
@Controller('gamemsg')
export class GameChatMsgController {
    constructor(
        private readonly gameChatMsgServices: GameChatMsgService,
    ) {}
}