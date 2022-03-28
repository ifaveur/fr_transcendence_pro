export interface IGameList {
    gamemode: string;
    id: number;
    iduser: number;
    name: string;
    path: string;
    playerstatus: string;
    status: string;
}

export interface IGameListObject {
    waiting: IGameList[];
    progress: IGameList[];
}

export interface IGame {
	id: number,
	iduser1: number,
	iduser2: number,
}