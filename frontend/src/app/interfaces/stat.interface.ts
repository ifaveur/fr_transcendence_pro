import { IUser } from "./user.interface";

export interface IStatOnUser {
	id: number;
	iduser: number;
	lv: number;
	xp: number;
	nbgameplayed: number;
	nbvictory: number;
	nblose: number;
	ratio: number;
	maxwingap: number;
	minwingap: number;
	maxlosegap: number;
	minlosegap: number;
}

export interface IStatAllUser {
	id: number;
	iduser: number;
	lv: number;
	xp: number;
	nbgameplayed: number;
	nbvictory: number;
	nblose: number;
	ratio: number;
	maxwingap: number;
	minwingap: number;
	maxlosegap: number;
	minlosegap: number;
	user: IUser;
}

export interface IUserHistory {
	id: number;
	gamemode: string;
	iduser: number;
	score: number;
	user: string;
	lv: number;
	path: number;
	option: number;
}