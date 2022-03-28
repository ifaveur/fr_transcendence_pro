import {
	Controller,
	UseGuards} from "@nestjs/common";
import { GameService } from "./game.service";

import { JwtGuard } from 'src/auth/guards/jwt.guard';

@UseGuards(JwtGuard)
@Controller('pong')
export class GameController {
	constructor(
		private readonly gameService: GameService,
		) {}

}
