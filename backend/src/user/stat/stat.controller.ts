import { Controller, UseGuards } from "@nestjs/common";
import { JwtGuard } from "src/auth/guards/jwt.guard";

@UseGuards(JwtGuard)
@Controller('stat')
export class StatController {
    constructor(

    ) {}

    
}