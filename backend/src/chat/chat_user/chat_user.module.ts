import {
	Controller,
	Module
} from "@nestjs/common";
import { FriendListService } from "src/user/friend_list/friend_list.service";
import { MpService } from "src/user/mp/mp.service";
import { ChatUserController } from "./chat_user.controller";
import { ChatUserService } from "./chat_user.service";


@Module({
    imports: [],
    controllers: [ChatUserController],
    providers: [
		ChatUserService,
		FriendListService,
		MpService
	],
	exports: [ChatUserService]
})
export class ChatUserModule {
    
}