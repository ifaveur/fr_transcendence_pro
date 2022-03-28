import { Module } from "@nestjs/common";
import { BlackListController } from "./black_list.controller";
import { BlackListService } from "./black_list.service";


@Module({
    imports: [],
    controllers: [BlackListController],
    providers: [
		  BlackListService,
	  ],
})
export class BlackListModule {
    
}