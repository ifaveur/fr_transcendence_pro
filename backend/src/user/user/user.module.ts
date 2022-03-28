import { forwardRef, Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController, UserLoggedController } from "./user.controller";
import { AuthModule } from "src/auth/auth.module";
import { SocketService } from "../socket/socket.service";
import { ChatAdminModule } from "src/chat/chat_admin/chat_admin.module";
import { FriendListService } from "../friend_list/friend_list.service";
import { BlackListService } from "../black_list/black_list.service";
import { MpService } from "../mp/mp.service";
import { StatService } from "../stat/stat.service";
import { GameModule } from "src/game/game.module";
import { GameService } from "src/game/game.service";
import { GameChatService } from "src/game_chat/game_chat/game_chat.service";


@Module({
    imports: [
        forwardRef(() => AuthModule),
		ChatAdminModule,
    ],
    controllers: [
		UserController,
		UserLoggedController,
	],
    providers: [
		GameService,
		UserService,
		GameChatService,
		SocketService,
		FriendListService,
		BlackListService,
		MpService,
		StatService,
	],
	exports: [UserService]
})
export class UserModule {
    
}