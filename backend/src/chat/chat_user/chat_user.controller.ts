import { Controller } from "@nestjs/common";
import { ChatUserService } from "./chat_user.service";

@Controller('chatUser')
export class ChatUserController {
    constructor(
		private readonly chatUserServices: ChatUserService,
		) {}

}