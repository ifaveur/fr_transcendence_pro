import { IUser } from '../interfaces/user.interface';

export interface IChatMsg{
    id?: number;
    message: string;
    createdat?: Date;
    idChat: number;
    userid: number;
    user?: IUser;
}

export interface ISocketMsg {
    message: string;
    idUser: number;
    idChat: number;
}

export interface IMpChange {
    MpID: number;
    MpMsg: IMpMsg[]
}

export interface IMpMsg {
    id?: number;
    idmp: number;
    iduser: number;
    message: string;
    date?: Date;
    user?: IUser;
}

export interface IGameChatMsg{
    id?: number;
    message: string;
    updatedat?: Date;
    idchatgame: number;
    iduser: number;
    user?: IUser;
}
