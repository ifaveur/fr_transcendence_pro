import { Module } from "@nestjs/common";
import { ChatAdminModule } from "src/chat/chat_admin/chat_admin.module";
import { ChatAdminService } from "src/chat/chat_admin/chat_admin.service";
import { GameModule } from "src/game/game.module";
import { GameService } from "src/game/game.service";
import { GameChatService } from "src/game_chat/game_chat/game_chat.service";
import { LoggerService } from "src/logger/logger.service";
import { BlackListService } from "../black_list/black_list.service";
import { FriendListModule } from "../friend_list/friend_list.module";
import { FriendListService } from "../friend_list/friend_list.service";
import { MpService } from "../mp/mp.service";
import { StatModule } from "../stat/stat.module";
import { StatService } from "../stat/stat.service";
import { SocketController } from "./socket.controller";
import { SocketService } from "./socket.service";

@Module({
	imports: [
		ChatAdminModule,
	],
	controllers: [SocketController],
	providers: [
		GameService,
		GameChatService,
		StatService,
		ChatAdminService,
		FriendListService,
	  	BlackListService,
		SocketService,
		LoggerService,
		MpService,
	],
})
export class SocketModule {
	
}