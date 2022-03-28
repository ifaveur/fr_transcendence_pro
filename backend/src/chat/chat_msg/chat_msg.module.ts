import { Module } from "@nestjs/common";
import { ChatMsgController } from "./chat_msg.controller";
import { ChatMsgService } from "./chat_msg.service";


@Module({
    imports: [],
    controllers: [ChatMsgController],
    providers: [
		ChatMsgService,
	],
	exports: [ChatMsgService]

})
export class ChatMsgModule {
    
}