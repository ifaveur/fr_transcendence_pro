import { Module } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { FriendListController } from "./friend_list.controller";
import { FriendListService } from "./friend_list.service";

@Module({
    imports: [],
    controllers: [FriendListController],
    providers: [
        FriendListService,
        LoggerService
    ],
})
export class FriendListModule {
    
}