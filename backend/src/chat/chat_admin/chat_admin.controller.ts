import {
	Body,
	Controller,
	Get,
	Param,
	UseGuards,
	Post } from "@nestjs/common";
import { ChatAdminService } from "./chat_admin.service";
import { CreateAdminDto } from "./dto/create-admin.dto";

import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('admin')
export class ChatAdminController {
    constructor(
		private readonly chatAdminServices: ChatAdminService,
		) {}

}