import { Module } from "@nestjs/common";
import { GameController } from "./game.controller";
import { GameService } from "./game.service";
import { LoggerService } from 'src/logger/logger.service';
import { SocketService } from 'src/user/socket/socket.service'
import { ChatAdminService } from "src/chat/chat_admin/chat_admin.service";
import { FriendListService } from "src/user/friend_list/friend_list.service";
import { BlackListService } from "src/user/black_list/black_list.service";
import { MpService } from "src/user/mp/mp.service";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user/user.module";
import { GameGateway } from "./game.gateway";
import { ChatUserService } from "src/chat/chat_user/chat_user.service";
import { GameChatService } from "src/game_chat/game_chat/game_chat.service";
import { GameChatMsgService } from "src/game_chat/game_chat_msg/game_chat_msg.service";
import { StatService } from "src/user/stat/stat.service";
import { MatchMakingService } from "./matchmaking.service";

@Module({
    imports: [
		AuthModule,
		UserModule,
	],
    controllers: [GameController],
    providers: [
		GameService,
		GameGateway,
		StatService,
		LoggerService,
		SocketService,
		ChatAdminService,
		FriendListService,
		BlackListService,
		MpService,
		AuthModule,
		UserModule,
		ChatUserService,
		GameChatService,
		GameChatMsgService,
		StatService,
		MatchMakingService
	],
})
export class GameModule {

}