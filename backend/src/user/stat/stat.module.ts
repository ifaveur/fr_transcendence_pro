import { Module } from "@nestjs/common";
import { StatController } from "./stat.controller";
import { StatService } from "./stat.service";

@Module({
    imports: [

    ],
    controllers: [
        StatController
    ],
    providers: [
        StatService,
    ]
})
export class StatModule {
    
}