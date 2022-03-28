import { UserEntity } from "src/db/entities/user.entity";

export class CreateUserDto {
    login: string;
    email: string;
    image_url: string;
}

export class CreateUserNameDto {
    name: string;
}
 
export class UserDTO {
	login: string;
	email: string;
    is2FA: boolean;


	constructor(user: UserEntity) {
	}
}
