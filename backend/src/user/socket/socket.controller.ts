import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { NewSocketDto } from "./dto/socket.dto";
import { SocketService } from "./socket.service";

@UseGuards(JwtGuard)
@Controller('socket')
export class SocketController {
    constructor(
        private readonly socketServices: SocketService
    ) {}
}