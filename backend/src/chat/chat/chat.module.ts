import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

import { ChatMsgService } from 'src/chat/chat_msg/chat_msg.service';

@Module({
    imports: [
	],
    controllers: [ChatController],
    providers: [
		ChatMsgService,
		ChatService,
	],
	exports: [ChatService]
})
export class ChatModule {
    
}