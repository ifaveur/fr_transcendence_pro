
export enum userStatus {
    ONLINE = "online",
    OFFLINE = "offline",
    INGAME = "ingame"
}

export enum chatUserStatus {
    MUTE = "mute",
    BAN = "ban",
    NONE = "none"
}

export interface IUser {
    id?: number;
    login?: string;
    name?: string;
    image_url?: string;
    status?: userStatus;
    email?: string;
  }

export interface ILobbyUser {
	id: number,
	username: string,
	picture: string
}

export interface IOnlineUser {
   offline: IUser[];
   online: IUser[];
   ingame: IUser[];
   gamestartpage: IUser[];
   spectator: IUser[];
   matchmaking: IUser[]
}

export interface IFriendList {
    friend: IUser[];
    nonfriend: IUser[];
 }

 export interface IBlackList {
    blocked: IUser[];
    nonblocked: IUser[];
 }

export interface IUserInChat {
    id: number;
    name: string;
    login: string;
    path: string;
}

export interface IUserInChatDetails {
    id: number;
    name: string;
    login: string;
    path: string;
    chatid: number;
    status: chatUserStatus;
    time: number;
    date: Date;
    isadmin: string;
    issuperadmin: string;
}
