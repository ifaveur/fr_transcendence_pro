import { chatUserStatus } from "src/db/entities/chatuser.entity";

export class UserJoinChatDto {
    idUser: number;
    idChat: number;
}

export class UserJoinChatLockerDto {
    idUser: number;
    idChat: number;
    islocked: boolean;
    tryPassword: string;
}

export class UserInChatDto {
    id: number;
    name: string;
    login: string;
    path: string;
}

export class UserInChatDetailsDto {
    id: number;
    name: string;
    login: string;
    path: string;
    chatid: number;
    status: chatUserStatus;
    time: number;
    date: Date;
    isadmin: number;
    issuperadmin: number;
}