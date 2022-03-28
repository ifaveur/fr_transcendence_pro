import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user/user.service';

@Injectable()
export class UploadPicService {

    constructor(private userService : UserService) {}
}
