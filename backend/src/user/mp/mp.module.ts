import { Logger, Module } from "@nestjs/common";
import { MpController } from "./mp.controller";
import { MpService } from "./mp.service";


@Module({
    imports: [],
    controllers: [MpController],
    providers: [
		MpService,
	],
})
export class MpModule {
    
}