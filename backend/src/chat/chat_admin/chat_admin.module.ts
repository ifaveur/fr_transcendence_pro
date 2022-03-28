import { Module } from "@nestjs/common";
import { ChatAdminController } from "./chat_admin.controller";
import { ChatAdminService } from "./chat_admin.service";


@Module({
    imports: [],
    controllers: [ChatAdminController],
    providers: [
		ChatAdminService,
	],
	exports: [ChatAdminService]
})
export class ChatAdminModule {
    
}