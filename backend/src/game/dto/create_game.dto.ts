import { gameMode, gameStatus, playersStatus } from "src/db/entities/game.entity";

export class CreateGameDto {
    idUser: number;
    gameMode: gameMode;
	socketid: string;
}

export class JoinGameDto {
    idGame: number;
    idUser: number;
	socketid: string;
}

export class ServerJoinGameDto {
    idGame: number;
	socketid: string;
}

export class UpdateGamePointDto {
    idGame: number;
    iduser1: number;
    pointUser1: number;
    iduser2: number;
    pointUser2: number;
}

export class SimpleGameDataDto {
    id: number;
    status: gameStatus;
    gamemode: gameMode;
    playersstatus: playersStatus;
    iduser: number;
}

export class SimpleGameDataDtoTwoPlayer {
    id: number;
    status: gameStatus;
    gamemode: gameMode;
    playersstatus: playersStatus;
    iduser1: number;
    iduser2: number;
}

export class GameDataDto {
    idgame: number;
    status: gameStatus;
    gamemode: gameMode;
    playersstatus: playersStatus;
    iduser: number;
    usersocket: string;
    serversocket: string;
}
