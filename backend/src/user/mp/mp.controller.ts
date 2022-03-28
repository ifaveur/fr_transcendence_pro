import { Controller } from "@nestjs/common";
import { MpService } from "./mp.service";


@Controller("mp")
export class MpController {
    constructor(
		private readonly mpServices: MpService,
		
		) {}

}