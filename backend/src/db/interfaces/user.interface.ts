import { userStatus } from "../entities/user.entity";

export interface IUser {
    id?: number;
    name: string;
    profilePath: string;
    status: userStatus;
    loginToken: string;
}