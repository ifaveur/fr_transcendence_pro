import { Injectable } from "@nestjs/common";
import { SocketEntity } from "src/db/entities/socket.entity";
import { LoggerService } from "src/logger/logger.service";
import { NewSocketDto } from "./dto/socket.dto";
import { logger } from "src/global-var/global-var.service";
import { ChatAdminService } from "src/chat/chat_admin/chat_admin.service";
import { ChatUserEntity } from "src/db/entities/chatuser.entity";
import { In, MoreThan, Not } from "typeorm";
import { FriendListService } from "../friend_list/friend_list.service";
import { BlackListService } from "../black_list/black_list.service";
import { MpService } from "../mp/mp.service";
import { MpUserEntity } from "src/db/entities/mpuser.entity";
import { GameService } from "src/game/game.service";
import { GameChatService } from "src/game_chat/game_chat/game_chat.service";
import { GameUserSocketEntity } from "src/db/entities/gameusersocker.entity";

@Injectable()
export class SocketService {
    constructor(
		private chat_admin: ChatAdminService,
		private friend: FriendListService,
		private block: BlackListService,
		private mp: MpService,
		private gameService: GameService,
		private gameChat: GameChatService
	) {}

    async insert(socket: NewSocketDto) {
        const sockdb : SocketEntity = SocketEntity.create()
        sockdb.iduser = socket.userID
        sockdb.socketid = socket.socketID
        await sockdb.save()
        return sockdb
    }

	async changeChatID(ID: number, chatID: number) {
		const sock: SocketEntity = await SocketEntity.findOne({
			where : {
				id: ID
			}
		})
		sock.chatid = chatID
		await sock.save()
		return sock
	}

	async changeMpID(ID: number, mpID: number) {
		const sock: SocketEntity = await SocketEntity.findOne({
			where : {
				id: ID
			}
		})
		sock.mpid = mpID
		await sock.save()
		return sock
	}

	async changeInterface(socketID: string, interfaceID: number) {
		const socket = (await this.getSocketBySocketID(socketID))
		if (!socket || !socket.id)
			return

		socket.interface = interfaceID
		await socket.save()
		return socket
	}

    async deleteByUserID(idUser: number) {
        await SocketEntity.delete({
            iduser: idUser,
        })
    }

    async deleteSocket(id: number) {
        await SocketEntity.delete({
            id: id,
        })
    }

	async deleteBySocketID(socketID: string) {
        await SocketEntity.delete({
            socketid: socketID,
        })
    }

	async deleteAllSockets() {
		var test = await this.getAllSockets()
		for (var t of test) {
			await SocketEntity.delete({
				id: t.id
			})
		}
	}


    async getSocketsByUserID(idUser: number) {
        return await SocketEntity.find({where : {iduser: idUser}})
    }

	async getSocketsByInterface(interfaceID: number) {
        return await SocketEntity.find(
			{
				where : {
					interface: interfaceID
				}
			})
    }

    async getSocketsByUserIDandChatID(idUser: number, idChat: number) {
        return await SocketEntity.find({
			where : {
				iduser: idUser,
				chatid: idChat,
			}
		})
    }


    async getSocketsByUserIDexeptINTandChatID(idUser: number, Interface: number, idChat: number) {
        const sockets = await SocketEntity.find({
			where : {
				iduser: idUser,
			}
		})
		var sockWithoutExept: SocketEntity[] = []
		for (const socket of sockets) {
			if (socket.interface === Interface && socket.chatid === idChat) {
				continue
			}
			sockWithoutExept.push(socket)
		}
		return sockWithoutExept
    }

	async getSocketsByUserIDandInterface(idUser: number, interf: number) {
        const ret =  await SocketEntity.find({
			where : {
				iduser: idUser,
				interface: interf,
			}
		})
		return (ret);
    }

	async getFriendsSocketsOfUser(userID: number,) {
		const friends = await this.friend.getFriendList(userID)
		
		var friendsID:number[] = [];
		friends.forEach(e => {
			friendsID.push(e.id);
		})

		const result: SocketEntity[] = await SocketEntity.find({
			where: {
				iduser: In(friendsID),
			}
		})
		return result
    }

	async getBlockersSocketsOfUser(userID: number,) {
		const blockers = await this.block.getBlockersList(userID)
		
		var blockersID:number[] = [];
		blockers.forEach(e => {
			blockersID.push(e.id);
		})

		const result: SocketEntity[] = await SocketEntity.find({
			where: {
				iduser: In(blockersID),
			}
		})
		return result
    }

	async getSocketsOfMpContactsOfUser(userID: number) {
		const allMP = await this.mp.getMpList(userID)

		var MPcontacts:number[] = [];

		allMP.forEach(e => {
			MPcontacts.push(e.iduser);
		})

		const result: SocketEntity[] = await SocketEntity.find({
			where: {
				iduser: In(MPcontacts),
			}
		})
		return result
	}



	async getSocketsFromChatIdAdmins(chatID: number) {
		const sockets = await this.getSocketsByChatID(chatID)
		var sockAdmins: SocketEntity[] = []
		for (const socket of sockets) {
			if ((await this.chat_admin.isAdmin(socket.iduser, socket.chatid)) === true) {
				sockAdmins.push(socket)
			}
		}
		return sockAdmins
	}

    async getSocketByID(ID: number) {
        return await SocketEntity.findOne({where : {id: ID}});
    }

	async getSocketBySocketID(socketID: string) {
        return await SocketEntity.findOne({where : {socketid: socketID}});
    }

	async getSocketsByChatID(chatID: number) {
        return await SocketEntity.find(
			{
				where : {
					chatid: chatID
				}
			});
    }

	async getSocketsOnOpenPopUp() {
		return await SocketEntity.find(
			{
				where : {
					chatid: MoreThan(-1),
				}
			})
	}

	async getSocketsOfUserOnOpenPopUp(userID: number) {
		const result: SocketEntity[] = await SocketEntity.find({
			where: {
				iduser: userID,
				mpid: MoreThan(-1)
			}
		})
		return result
	}

	async getSocketsByMpID(mpID: number) {
        return await SocketEntity.find(
			{
				where : {
					mpid: mpID
				}
			});
    }

	async getAllSockets() {
		return await SocketEntity.find()
	}


	async getSocketsByChatUsersInOpenPopUp(chatID: number) {
		const chatUsers = await ChatUserEntity.find({
			where: {
				chatid: chatID
			}
		})
		var chatusersID:number[] = [];
		chatUsers.forEach(e => {
			chatusersID.push(e.userid);
		});
		const result: SocketEntity[] = await SocketEntity.find({
			where: {
				iduser: In(chatusersID),
				chatid: MoreThan(-1)
			}
		})
		return result
    }

	async getSocketsByGameChatID(gameChatID: number) {
        return await SocketEntity.find(
			{
				where : {
					gamechatid: gameChatID,
				}
			});
	}

	async changeSocketGameChatID(socketid: string, gameChatID: number) {
		const socket: SocketEntity = await SocketEntity.findOne(
			{
				where : {
					socketid: socketid,
				}
			});
		if (socket) {
			socket.gamechatid = gameChatID
			await socket.save()
		}
		return socket
	}

	async changeSocketofAllPlayersAndSpec(gameID: number, newGameChatID: number) {
		const gameSockets: GameUserSocketEntity[] = await GameUserSocketEntity.find({
			where: {
				idgame: gameID
			}
		})

		for (const gameSocket of gameSockets)
			await this.changeSocketGameChatID(gameSocket.socket, newGameChatID)
	} 

}