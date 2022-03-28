import { IUser } from "./user.interface";

export interface IChat {
    id: number,
    name: string,
    islocked: boolean,
    isprivate: boolean,
    password: string,   
}

export interface UserJoinChatLockerDto {
    idUser: number,
    idChat: number,
    islocked: boolean,
    tryPassword: string,
}

export interface ICreateChat {
    name: string;
    isprivate: boolean;
    islocked: boolean;
    password: string;
}


export interface ICreateChatMore {
    id: number
    name: string;
    isprivate: boolean;
    islocked: boolean;
    password: string;
}

export interface IMpList {
    idmp: number;
    iduser: number;
    user: IUser;
}