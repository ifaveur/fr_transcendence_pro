import { Controller } from "@nestjs/common";
import { ChatMsgService } from "./chat_msg.service";

@Controller('chatMsg')
export class ChatMsgController {
    constructor(
		private readonly chatMsgServices: ChatMsgService,
		
		) {}

}