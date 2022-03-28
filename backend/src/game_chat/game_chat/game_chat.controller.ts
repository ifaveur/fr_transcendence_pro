import { Controller, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { GameChatService } from "./game_chat.service";

@UseGuards(JwtGuard)
@Controller('gamechat')
export class GameChatController {
    constructor(
        private readonly gameChatServices: GameChatService,
    ) {}

}