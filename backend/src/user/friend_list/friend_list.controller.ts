import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { NewFriendDto } from "./dto/friend_list.dto";
import { FriendListService } from "./friend_list.service";

@UseGuards(JwtGuard)
@Controller('friendlist')
export class FriendListController {
    constructor(
        private readonly friendListService: FriendListService
    ) {}
}