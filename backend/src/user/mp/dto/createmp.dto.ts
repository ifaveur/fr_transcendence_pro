export class NewMpDto {
    idUserFrom: number;
    idUserTo: number;
    message: string;
}

export class CreateMpRoomDto {
    iduser1: number;
    iduser2: number;
}

export class InsertMpDto {
    idmp: number;
    iduser: number;
    message: string;

}