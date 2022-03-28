import {
	Controller,
	UseGuards } from "@nestjs/common";
import { BlackListService } from "./black_list.service";

import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('blacklist')
export class BlackListController {
    constructor(private readonly blackListServices: BlackListService) {}
}