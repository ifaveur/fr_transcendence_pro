import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { UserService } from 'src/user/user/user.service';
import { logger } from 'src/global-var/global-var.service';
import { SocketService } from 'src/user/socket/socket.service';
import { SocketEntity } from 'src/db/entities/socket.entity';
import { ChatUserService } from '../chat_user/chat_user.service';
import { GameService } from 'src/game/game.service';
import { GameUserSocketEntity } from 'src/db/entities/gameusersocker.entity';
import { userStatus } from 'src/db/entities/user.entity';
import { GameChatService } from 'src/game_chat/game_chat/game_chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MasterGateway {
	@WebSocketServer()
	server: Server;

	constructor(
		protected userService: UserService,
		protected sock: SocketService,
		protected chatUser: ChatUserService,
		protected game: GameService,
		protected gameChat: GameChatService,
	) {}

	async onModuleInit(socket: Socket) {
	}

	public afterInit(server: Server): void {
		logger();
	}


	async delay(ms: number) {
		return new Promise( resolve => setTimeout(resolve, ms) );
	}

	async getNotifOfChangeState(signal: string, state: boolean) {
		var notif: { type: string, msg: string }
		if (signal === 'switchMute')
			if (state === true)
				notif = { type: 'red', msg: 'You have been muted 🔇'}
			else
				notif = { type: 'green', msg: 'You have been unmuted 🔉'}
		else if (signal === 'switchBan')
			if (state === true)
				notif = { type: 'red', msg: 'You have been banned 🚷'}
			else
				notif = { type: 'green', msg: 'You have been unbanned 🎊' }
		else if (signal === 'switchAdmin') {
			if (state === true)
				notif = { type: 'green', msg: 'You have been promoted to admin 👑' }
			else
				notif = { type: 'red', msg: 'You have been demoted to basic user 🧎🏻‍♂️' }
		}
		return notif
	}


	async updateUserStatus(userID: number, userStatus: userStatus) {
		await this.userService.updateStatus(userID, userStatus);
		this.emitToServer('updateStatusList', await this.userService.getAllStatusUsers());
	}

	async updateUsersStatus(userIDs: number[], userStatus: userStatus) {
		if (!userIDs || userIDs.length === 0)
			return
		for (const userID of userIDs)
			await this.userService.updateStatus(userID, userStatus);
		this.emitToServer('updateStatusList', await this.userService.getAllStatusUsers());
	}

	async updateUsersStatusFromGameUserSock(sockets: GameUserSocketEntity[], userStatus: userStatus) {
		if (!sockets || sockets.length === 0)
			return
		for (const sock of sockets)
			await this.userService.updateStatus(sock.iduser, userStatus);
		this.emitToServer('updateStatusList', await this.userService.getAllStatusUsers());
	}

    emitToOne(socketid: string, signal: string, data) {
        this.server.to(socketid).emit(signal, data)
    }

    emitToServer(signal: string, data) {
        this.server.emit(signal, data)
    }

    async notifUser(userID: number,  notif: { type: string, msg: string}, mpID: number = null) {
		notif.type += '-snackbar'
		const sockets = await this.sock.getSocketsByUserID(userID)
		if (!sockets || sockets.length === 0)
			return
		if (mpID) {
			var notif2 = {
				type: notif.type,
				msg: notif.msg,
				mpID: mpID
			}
			notif = notif2
		}
		for (const sock of sockets) {
				this.emitToOne(sock.socketid, 'notification', notif)
		}
    }

	async removeAllSockFromGameChat(gameID: number) {
		const gameChat = await this.gameChat.getChatId(gameID)
		if (gameChat) {
			this.emitToGameChat(gameChat.id, 'destroyChat', null)
			await this.gameChat.deleteChatbyid(gameChat.id)
		}
		await this.sock.changeSocketofAllPlayersAndSpec(gameID, -1)
	}


	async emitToChatUsersInOpenPopUp(chatID: number, signal: string, data) {
		const sockets = await this.sock.getSocketsByChatID(chatID)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToChatID(chatID: number, signal: string, data) {
		const sockets = await this.sock.getSocketsByChatID(chatID)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToMpID(MpID: number, signal: string, data) {
		const sockets = await this.sock.getSocketsByMpID(MpID)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToAllChatsOfUser(userID: number, signal: string, data) {
		const chatsOfThisUser = await this.chatUser.getChatList(userID)
		if (!chatsOfThisUser || chatsOfThisUser.length === 0)
			return
        for (const chat of chatsOfThisUser)
            this.emitToChatID(chat.id, signal, data)
	}

	async emitToInterface(Interface: number, signal: string, data) {
		const sockets = await this.sock.getSocketsByInterface(Interface)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToUser(userID: number, signal: string, data) {
		const sockets = await this.sock.getSocketsByUserID(userID)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToFriends(userID: number, signal: string, data) {
		const sockets = await this.sock.getFriendsSocketsOfUser(userID)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToBlockers(userID: number, signal: string, data) {
		const sockets = await this.sock.getBlockersSocketsOfUser(userID)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToMpContactsOfUser(userID: number, signal: string, data) {
		const sockets = await this.sock.getSocketsOfMpContactsOfUser(userID)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToUserInChatID(userID: number, chatID: number, signal: string, data) {
		const sockets = await this.sock.getSocketsByUserIDandChatID(userID, chatID)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToChatIdAdmins(chatID: number, signal: string, data) {
		const sockets = await this.sock.getSocketsFromChatIdAdmins(chatID)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToUserOpenPopUp(userID: number, signal: string, data) {
		const sockets = await this.sock.getSocketsOfUserOnOpenPopUp(userID)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToAllOpenPopUp(signal: string, data) {
		const sockets = await this.sock.getSocketsOnOpenPopUp()
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToGameChat(gameChatID: number, signal: string, data) {
		const sockets = await this.sock.getSocketsByGameChatID(gameChatID)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	async emitToGameChatbyGameID(gameID: number, signal: string, data) {
		const gameChat = await this.gameChat.getChatId(gameID)
		if (!gameChat)
			return
		const sockets = await this.sock.getSocketsByGameChatID(gameChat.id)
		if (!sockets || sockets.length === 0)
			return
		this.emitTo(sockets, signal, data)
	}

	emitTo(sockets: SocketEntity[], signal: string, data) {
		if (!sockets || sockets.length === 0)
			return
		for (const socket of sockets)
			this.server.to(socket.socketid).emit(signal, data)
	}


	////////
	/////// G A M E
	//////

	async emitToGameStartPage(signal: string, data) {
		const sockets = await this.sock.getSocketsByInterface(3)
		if (!sockets || sockets.length === 0)
			return
		let socketsNotInGame: SocketEntity[] = []
		for (const socket of sockets) {
			if ((await this.userService.getUserById(socket.iduser)).status != userStatus.GAMESTARTPAGE)
				continue
			socketsNotInGame.push(socket)
		}
		if (!socketsNotInGame || socketsNotInGame.length === 0)
			return
		this.emitTo(socketsNotInGame, signal, data)
	}

	async emitToServerInstance(gameID: number, signal: string, data) {
		const socket = await this.game.getServerInstance(gameID)
		if (socket)
			this.server.to(socket.socket).emit(signal, data)
	}

	emitToStringTabSockets(sockets: string[], signal: string, data) {
		if (!sockets || sockets.length === 0)
			return
		this.server.to(sockets[0]).to(sockets[1]).emit(signal, data)

		for (var i = 2; i < sockets.length; i++)
			this.server.to(sockets[i]).emit(signal, data)
	}

	async emitToPlayerA(gameID: number, signal: string, data) {
		const sockets = await this.game.getSocketsPlayersFromGameID(gameID)
		if (!sockets || sockets.length === 0)
			return
		if (sockets[0] && sockets[0].socket) {
			this.server.to(sockets[0].socket).emit(signal, data);
		}
	}

	async emitToPlayerB(gameID: number, signal: string, data) {
		const sockets = await this.game.getSocketsPlayersFromGameID(gameID);
		if (!sockets || sockets.length < 2)
			return
		if (sockets[1] && sockets[1].socket) {
			this.server.to(sockets[1].socket).emit(signal, data)
		}
	}

	async emitToPlayers(gameID: number, signal: string, data) {
		const sockets = await this.game.getSocketsPlayersFromGameID(gameID)
		if (!sockets || sockets.length === 0)
			return
		for (var i = 0; i < 2; i++) {
			if (sockets[i] && sockets[i].socket)
				this.server.to(sockets[i].socket).emit(signal, data)
		}
	}

	async emitToSpec(gameID: number, signal: string, data) {
		const sockets = await this.game.getSocketsPlayersFromGameID(gameID)
		if (!sockets || sockets.length <= 2)
			return
		for (var i = 2; i < sockets.length; i++) {
			if (sockets[i] && sockets[i].socket)
				this.server.to(sockets[i].socket).emit(signal, data)
		}
	}

	async emitToPlayersAndSpec(gameID: number, signal: string, data) {
		const sockets = await this.game.getSocketsPlayersFromGameID(gameID)
		if (!sockets || sockets.length === 0)
			return;
		for (const socket of sockets) {
			if (socket && socket.socket)
				this.server.to(socket.socket).emit(signal, data);
		}
	}

	async emitToGameUserSocket(sockets: GameUserSocketEntity[], signal: string, data) {
		if (!sockets)
			return;
		for (const socket of sockets)
			this.server.to(socket.socket).emit(signal, data)
	}

	async emitToUserExceptActiveSocket(userID: number, signal: string, clientID: string, data: boolean) {
		const sockets = await this.sock.getSocketsByUserID(userID);
		if (!sockets || sockets.length === 0)
			return
		if (sockets.length > 1) {
			sockets.forEach(socket => {
				if (socket.socketid !== clientID)
					this.emitToOne(socket.socketid, signal, data);
			});
		}
	}

}
