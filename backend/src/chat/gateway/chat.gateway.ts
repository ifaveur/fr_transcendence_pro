import {
	SubscribeMessage, WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatAdminService } from 'src/chat/chat_admin/chat_admin.service'
import { ChatService } from 'src/chat/chat/chat.service'
import { ChatUserService } from 'src/chat/chat_user/chat_user.service'
import { ChatMsgService } from 'src/chat/chat_msg/chat_msg.service'
import { CreateChatDto } from 'src/chat/chat/dto/create-chat.dto'
import { UserJoinChatDto, UserJoinChatLockerDto } from 'src/chat/chat_user/dto/userjoinchat.dto'
import { UserService } from 'src/user/user/user.service';
import { CreateChatMsgDto } from 'src/chat/chat_msg/dto/create-chat_msg.dto'
import { ChatUserEntity, chatUserStatus } from 'src/db/entities/chatuser.entity'
import { logger } from 'src/global-var/global-var.service';
import { SocketService } from 'src/user/socket/socket.service';
import { userWarnDto } from '../chat_user/dto/userwarn.dto';
import { Cron } from '@nestjs/schedule';
import { MasterGateway } from './master.gateway';
import { GameService } from 'src/game/game.service';
import { GameChatService } from 'src/game_chat/game_chat/game_chat.service';
import { GameChatMsgService } from 'src/game_chat/game_chat_msg/game_chat_msg.service';
import { GameMsgDto } from 'src/game_chat/game_chat_msg/dto/game_chat_msg.dto';
import { MatchMakingService } from 'src/game/matchmaking.service';
import { userStatus } from 'src/db/entities/user.entity';
import { playersStatus } from 'src/db/entities/game.entity';
import { GameUserSocketEntity } from 'src/db/entities/gameusersocker.entity';
import { CreateMpRoomDto, InsertMpDto } from 'src/user/mp/dto/createmp.dto';
import { MpService } from 'src/user/mp/mp.service';
import { BlackListService } from 'src/user/black_list/black_list.service';
import { FriendListService } from 'src/user/friend_list/friend_list.service';
import { StatService } from 'src/user/stat/stat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway extends MasterGateway{

	UsersToCheck : ChatUserEntity[] = []

	constructor(
		public chat: ChatService,
		public chatMsg: ChatMsgService,
		chatUser: ChatUserService,
		public chatAdmin: ChatAdminService,
		userService: UserService,
		sock: SocketService,
		game: GameService,
		gameChat: GameChatService,
		public gameChatmsg: GameChatMsgService,
		public matchMaking: MatchMakingService,
		public mp: MpService,
		public blacklist: BlackListService,
		public friend: FriendListService,
		public statService: StatService,
	) {
		super(userService, sock, chatUser, game, gameChat)
	}

	async onModuleInit() {
		await this.updateListUsersToCheck()
		await this.sock.deleteAllSockets();
		await this.userService.resetAllStatus();
	}

	public afterInit(): void {
	}

	@SubscribeMessage('createRoom')
	async onCreateRoom(socket: Socket, roomDto: CreateChatDto) {
		logger()
		const userID = socket.data.user.id;
		const room = await this.chat.insert(roomDto);
		const userDto = { idUser: userID, idChat: room.id };


		await this.chatAdmin.insert(userDto, true);
		await this.chatUser.insert(userDto);

		this.emitToUserOpenPopUp(userID, 'updateRoomList', await this.chatUser.getChatList(userID));
		this.emitToAllOpenPopUp('_updateAvailableRoomList', null);
	}
	
	@SubscribeMessage('joinRoom')
	async onJoinRoom(socket: Socket, data: UserJoinChatLockerDto) {
		logger()
		const chat = await this.chat.getChatById(data.idChat);

		if (chat.islocked === true
			&& await this.chat.isMatchPassword(data.tryPassword, chat.password) === false) {
				this.emitToOne(socket.id, 'joinRoomError', { msg: "Password Error", roomid: data.idChat });
				this.notifUser(data.idUser, { type: 'red', msg: 'Wrong password' });
				return;
		}

		await this.chatUser.insert(data);

		this.emitToOne(socket.id, 'joinRoomOk', null);
		this.emitToChatID(chat.id, 'updateChatUsersList', await this.chatUser.getUserDetailFromChat(chat.id));
	
		this.emitToUserOpenPopUp(data.idUser, 'updateRoomList', await this.chatUser.getChatList(data.idUser));
	}

	@SubscribeMessage('destroyRoom')
	async onDestroyRoom(socket: Socket, chatID: number) {
		logger()

		const chat = await this.chat.getChatById(chatID);

		for (const user of await this.chatUser.getUserList(chatID)) {

			var userID = user.userid;

			for (const s of await this.sock.getSocketsByUserIDandChatID(userID, chatID))
				this.sock.changeChatID(s.id, 0);

			await this.chatUser.deleteuserfromchat({ idUser: userID, idChat: chatID });
			await this.chatAdmin.deleteAdmin({ idUser: userID, idChat: chatID });

			this.emitToUserOpenPopUp(userID, 'updateRoomList', await this.chatUser.getChatList(userID));

			this.notifUser(userID, { type: 'red', msg: '[' + chat.name + '] has been deleted' });
		}


		this.updateListUsersToCheck();

		await this.chatMsg.deleteAllMessageFromChat(chatID);
		await this.chat.delete(chatID);

		this.emitToAllOpenPopUp('_updateAvailableRoomList', null);
		this.emitToUserOpenPopUp(socket.data.user.id, 'updateRoomList', await this.chatUser.getChatList(userID));

	}

	@SubscribeMessage('leaveRoom')
	async onLeaveRoom(socket: Socket, data: UserJoinChatDto) {
		logger();
		const userID = data.idUser; const chatID = data.idChat;

		for (const s of await this.sock.getSocketsByUserIDandChatID(userID, chatID))
			this.sock.changeChatID(s.id, 0);


		await this.chatUser.deleteuserfromchat(data);
		await this.chatAdmin.deleteAdmin(data);

		this.updateListUsersToCheck();

		if ((await this.chatUser.getUserList(chatID)).length === 0) {
			this.onDestroyRoom(socket, chatID);
			return;
		}

		this.emitToChatID(chatID, 'updateChatUsersList', await this.chatUser.getUserDetailFromChat(chatID));
		this.emitToChatIdAdmins(chatID, 'updateAvailabUsersList', await this.chatUser.getUsersNotInThisChat(chatID));
		this.emitToUserOpenPopUp(userID, 'updateRoomList', await this.chatUser.getChatList(userID));


	}

	@SubscribeMessage('kickUser')
	async onKickUser(socket: Socket, data: UserJoinChatDto) {
		logger()
		this.onLeaveRoom(socket, data)
	}

	@SubscribeMessage('changeRoom')
	async onChangeRoom(socket: Socket, userJoinChatDto: UserJoinChatDto) {
		var sok = await this.sock.getSocketBySocketID(socket.id)
		sok = await this.sock.changeChatID(sok.id, userJoinChatDto.idChat)

		this.emitToOne(socket.id, 'changeRoom', {
			chatid: sok.chatid,
			msgs: await this.chatMsg.getAllMessageFromChat(sok.chatid)
		})
	}

	@SubscribeMessage('addMessage')
	async onAddMessage(socket: Socket, data: CreateChatMsgDto) {
		var ret = await this.chatMsg.insert(data)

		this.emitToChatID(data.idChat, 'addMessage', ret)
	}

	@SubscribeMessage('updateRoomInfo')
	async onUpdateRoomPassword(socket: Socket, data) {
		var room = await this.chat.getChatById(data.id)

		if (data.islocked === false && room.islocked === true)
			room = await this.chat.disablePassword(data.id)

		else if ((data.islocked === true && room.islocked === true && data.password
			&& await this.chat.isMatchPassword(data.password, room.password) === false)
			|| data.islocked === true && room.islocked === false)
				room = await this.chat.changePassword(room.id, data.password)

		if (room.isprivate != data.isprivate)
			room = await this.chat.switchRoomPrivacy(room.id, data.isprivate)

		if (room.name != data.name)
			room = await this.chat.changeName(room.id, data.name)

		this.emitToChatUsersInOpenPopUp(room.id, '_updateRoomList', null)
		this.emitToAllOpenPopUp('_updateAvailableRoomList', null)
 
	}

	@SubscribeMessage('updateMsgList')
	async onUpdateMsgList(socket: Socket, chatID: number) {
		this.emitToOne(socket.id, 'updateMsgList', await this.chatMsg.getAllMessageFromChat(chatID))
	}

	@SubscribeMessage('updateUserState')
	async onUpdateUserState(socket: Socket, chatID: number) {
		this.emitToOne( socket.id, 'updateUserState', await this.getUserState(socket.data.user.id, chatID))
	}

	@SubscribeMessage('changeUserState')
	async onChangeUserState(socket: Socket, data: { userWarnDto: userWarnDto, signal: string, state: boolean }) {
		const userID = data.userWarnDto.idUser
		const chatID = data.userWarnDto.idChat

		await this.changeStatus(data.userWarnDto, data.signal, data.state)

		await this.updateListUsersToCheck()

		if (data.signal === 'switchBan') {
			this.emitToUserOpenPopUp(userID, 'updateRoomList', await this.chatUser.getChatList(userID))
		}

		this.emitToUserInChatID(userID, chatID, 'updateUserState', await this.getUserState(userID, chatID))

		this.emitToChatID(chatID, 'updateChatUsersList', await this.chatUser.getUserDetailFromChat(chatID))

		this.notifUser(userID, await this.getNotifOfChangeState(data.signal, data.state))
	}

	async changeStatus(userWarnDto: userWarnDto, signal: string, state: boolean) {
		logger(userWarnDto, signal, state)

		if (state === true) {
			if (signal === 'switchMute')
				await this.chatUser.muteUser(userWarnDto)
			else if (signal === 'switchBan')
				await this.chatUser.banUser(userWarnDto)
			else if (signal === 'switchAdmin')
				await this.chatAdmin.insert(userWarnDto)

		} else {
			if (signal != 'switchAdmin')
				await this.chatUser.clearStatus(userWarnDto)
			else
				await this.chatAdmin.deleteAdmin(userWarnDto)
		}
	}

	@SubscribeMessage('updateRoomList')
	async onUpdateRoomList(socket: Socket) {
		this.emitToOne(socket.id, 'updateRoomList', await this.chatUser.getChatList(socket.data.user.id))
	}

	@SubscribeMessage('updateAvailabRoomList')
	async onLoadAvailableChatList(socket: Socket) {
		this.emitToOne(socket.id, 'updateAvailabRoomList', await this.chatUser.getAvailableChat(socket.data.user.id))
	}

	@SubscribeMessage('updateAvailabUsersList')
	async onUpdateAvailablUsersList(socket: Socket, roomID: number) {
		this.emitToOne(socket.id, 'updateAvailabUsersList', await this.chatUser.getUsersNotInThisChat(roomID))
	}

	@SubscribeMessage('addUsersToRoom')
	async onAddUsersToRoom(socket: Socket, data: {usersID: number[], roomID: number}) {
		logger()
		const chat = await this.chat.getChatById(data.roomID)

		for (const userID of data.usersID) {
			await this.chatUser.insert({ idUser: userID, idChat: data.roomID })
			this.notifUser(userID, {type: 'green', msg: 'You have been invited to new room: ' + chat.name + ' by '+ socket.data.user.name})
			this.emitToUserOpenPopUp(userID, 'updateRoomList', await this.chatUser.getChatList(userID))
		}

		this.emitToChatIdAdmins(chat.id, 'updateAvailabUsersList', await this.chatUser.getUsersNotInThisChat(chat.id))
		this.emitToChatID(chat.id, 'updateChatUsersList', await this.chatUser.getUserDetailFromChat(chat.id))
	}

	@SubscribeMessage('updateChatUsersList')
	async onUpdateUserList(socket: Socket, chatID: number) {
		this.emitToOne(socket.id, 'updateChatUsersList', await this.chatUser.getUserDetailFromChat(chatID))
	}

	async getUserState(userID: number, chatID: number) {
		return {
			mute: await this.chatUser.isMuted(userID, chatID),
			ban: await this.chatUser.isBanned(userID, chatID),
			admin: await this.chatAdmin.isAdmin(userID, chatID),
			superAdmin: await this.chatAdmin.isSuperAdmin(userID, chatID)
		}
	}

	async updateListUsersToCheck() {
		this.UsersToCheck = await this.chatUser.getListBanMute()
	}

	@Cron('*/5 * * * * *')
	async handleCron() {
		const usersToCheck = this.UsersToCheck
		if (!usersToCheck.length)
			return
		const dateNow = new Date()
		for (const user of usersToCheck) {
			var dif = dateNow.getTime() - user.updatedat.getTime();
			var dif_in_second = dif / 1000;
			logger(
				'user id:', user.userid,
				" is ", user.status,
				" for ", user.time - dif_in_second,
				" second from chat ", user.chatid, 'AUTO'
			)
			if (dif_in_second > user.time) {
				const userDto = { idUser: user.userid, idChat: user.chatid,time: 0 }
				var data = {
					userWarnDto: userDto,
					signal: user.status === chatUserStatus.MUTE ?
						'switchMute' : 'switchBan',
					state: false
				}
				this.onChangeUserState(null, data)
			}
		}
	}


//////////////////////////////////////////////////////////////////////////////////////////
// GAMECHAT
//////////////////////////////////////////////////////////////////////////////////////////


	@SubscribeMessage('addChatGameMsg')
	async onAddChatGameMsg(socket: Socket, msgDto: GameMsgDto) {
		logger()

		const msg = await this.gameChatmsg.insert(msgDto)
		this.emitToGameChat(msg.idchatgame, 'addChatGameMsg', msg)
	}

	@SubscribeMessage('getMessageFromGameChat')
	async onGetMsgFromGameChat(socket: Socket, chatid: number) {
		logger()

		this.emitToOne(socket.id, 'getMessageFromGameChat', await this.gameChatmsg.getMessageFromChat(chatid))
	}


//////////////////////////////////////////////////////////////////////////////////////////
// HANDLE CONNECT
//////////////////////////////////////////////////////////////////////////////////////////

	async handleConnection(socket: Socket) {
		logger('new connection', socket.handshake.auth.idUser, 'FLASH')
		const userID = socket.handshake.auth.idUser;

		if (userID === 'SERVER INSTANCE')
			return;

		if (!userID || (await this.userService.getUserById(userID)) == undefined)
			return socket.disconnect();

		// MULTI SOCKET BLOCK // let handleDisconnect to finish, if refreshing window
		for (let limit = 1, time = 500, i = 0; i < limit; i++) {
			if ((await this.sock.getSocketsByUserID(userID)).length === 0){
				break
			} else if (i === limit - 1) {
				const sockToDestroy = (await this.sock.getSocketsByUserID(userID))
				if (sockToDestroy && sockToDestroy.length) {
					for (const sock of sockToDestroy)
						this.emitToOne(sock.socketid, 'multiSocketError', (await this.userService.getUserById(userID)).name)
				}
			}
			await this.delay(time)
		}

		socket.data.user = await this.userService.getUserById(userID)

		if (socket.data.user.status === userStatus.OFFLINE)
			this.updateUserStatus(userID, userStatus.ONLINE);
		else
			this.emitToOne(socket.id, 'updateStatusList', await this.userService.getAllStatusUsers());

		const sock = await this.sock.insert({ userID: userID, chatID: 0, socketID: socket.id });

		if (new Date().getTime() - socket.data.user.createdat.getTime() < 15000)
			this.handleNewUser(userID);

		this.emitToOne(socket.id, 'connectCallBack', null);
		socket.data.start = 1

		// protect multi socket
		const sockToDestroy = (await this.sock.getSocketsByUserID(userID))
		if (sockToDestroy && sockToDestroy.length > 1) {
			for (const sock of sockToDestroy) {
				if (sock.socketid != socket.id)
					this.emitToOne(sock.socketid, 'multiSocketError', (await this.userService.getUserById(userID)).name)
			}
		}
	}

	async handleDisconnect(socket: Socket) {
		if (socket.data.user)
			logger(socket.data.user.login.magenta);
		else
			logger('ERROR', socket.data, socket.id);

		// let time to handleConnect to finish if not
		if (socket.data.start !== 1) {
			for (let time = 1000, i = 0, limit = 10; i < limit; i++) {
				if (i === limit - 1) {
					return socket.disconnect();
				}
				if ((await this.sock.getSocketBySocketID(socket.id)))
					break;
				await this.delay(time);
			}
		}

		const user = await this.userService.getUserById(socket.data.user.id);
		const sock = await this.sock.getSocketBySocketID(socket.id)
		if (sock && sock.interface && sock.interface === 3) {
			if (user.status === userStatus.INGAME) {
				await this.handleEnd(socket, 'disconnect');
			} else if (user.status === userStatus.MATCHMAKING) {
				await this.onCancelMatchmaking(socket);
			} else if (user.status === userStatus.SPECTATOR) {
				await this.onLeavingSpectator(socket);
			} else if (user.status === userStatus.GAMESTARTPAGE) {
				await this.disconnectUserFromLobby(socket);
			}
		}

		if (user.status != userStatus.ONLINE)
			this.updateUserStatus(socket.data.user.id, userStatus.ONLINE);


		await this.sock.deleteBySocketID(socket.id);
		socket.disconnect();

		// manage offline status after x seconds
		if (socket.data.user != undefined) {
			await this.delay(15000);
				if ((await this.sock.getSocketsByUserID(socket.data.user.id)).length === 0) 
					this.updateUserStatus(socket.data.user.id, userStatus.OFFLINE)
		}
	}

	async handleNewUser(userID: number) {
		logger()
		const allChats = await this.chat.getAllChats();
		if (!allChats || allChats.length === 0)
			return;
		for (const chat of allChats)
			this.emitToChatIdAdmins(chat.id, 'updateAvailabUsersList', await this.chatUser.getUsersNotInThisChat(chat.id));
	}

	@SubscribeMessage('changeInterface')
	async onChangeInterface(socket: Socket, interfaceID: number) {
		if (!socket.data.user)
			return;
					
		if (interfaceID === null || interfaceID === undefined)
			interfaceID = 1;

		if ((await this.sock.getSocketBySocketID(socket.id)).interface)
			logger((await this.sock.getSocketBySocketID(socket.id)).interface + ' |-> '.magenta + interfaceID);

		if (interfaceID === 1) {
			this.emitToOne(socket.id, 'updateGamesList', await this.game.getGamesLists())
		} else if (interfaceID === 3
			&& await this.game.getSocketPlayerFromUserID(socket.data.user.id) === undefined) {
				this.updateUserStatus(socket.data.user.id, userStatus.GAMESTARTPAGE);
		}
		await this.sock.changeInterface(socket.id, interfaceID);
	}

	@SubscribeMessage('openPopUp')
	async onOpenPopUp(socket: Socket) {
		const sock = await this.sock.getSocketBySocketID(socket.id);
		if (!sock)
			return;
		await this.sock.changeChatID(sock.id, 0);
		await this.sock.changeMpID(sock.id, 0);
	}

	@SubscribeMessage('closePopUp')
	async onClosePopUp(socket: Socket) {
		const sock = await this.sock.getSocketBySocketID(socket.id);
		if (!sock)
			return;
		await this.sock.changeChatID(sock.id, -1);
		await this.sock.changeMpID(sock.id, -1);
	}

	@SubscribeMessage('cancelMatchmaking')
	async onCancelMatchmaking(client: Socket) {
		logger();

		await this.updateUserStatus(client.data.user.id, userStatus.GAMESTARTPAGE)
		await this.matchMaking.deleteByUserID(client.data.user.id);
		this.emitToOne(client.id, 'cancelMatchmakingCallback', null);
	}

	@SubscribeMessage('end')
	async handleEnd(client: Socket, data: string){
		if (!client.data.gameID || (client.data.player !== 'A' && client.data.player !== 'B' && client.data.player !== 'SERVER INSTANCE'))
			return;

		const playersAndSpec: GameUserSocketEntity[] = await this.game.getSocketsPlayersFromGameID(client.data.gameID);
		if (!playersAndSpec || playersAndSpec.length < 2)
			return;

		await this.game.setPlayerStatus(client.data.gameID, playersStatus.NONE);

		if (!data)
			data = '666,777';
		let scoreA: number, scoreB: number;
		if (data === 'disconnect') {
			if (client.data.player === 'A') {
				scoreA = 0; scoreB = 11; 
			} else if (client.data.player === 'B') {
				scoreA = 11; scoreB = 0; }
		} else {
			var u = data.split(',');
			scoreA = (u[0] as unknown) as number,
			scoreB = (u[1] as unknown) as number
		}
		this.emitToPlayersAndSpec(client.data.gameID, 'updatescore', `${scoreA},${scoreB}`);
		this.emitToPlayersAndSpec(client.data.gameID, 'endgame', `${scoreA},${scoreB}`);
		this.emitToServerInstance(client.data.gameID, 'endserver', null);
		this.emitToPlayersAndSpec(client.data.gameID, 'updateSocketPlayerInfo', { pos: '0', gameID: 0 });

		await this.game.endGame({
			idGame: client.data.gameID,
			iduser1: playersAndSpec[0].iduser,
			pointUser1: scoreA,
			iduser2: playersAndSpec[1].iduser,
			pointUser2: scoreB
		});

		this.server.except(playersAndSpec[0].socket).except(playersAndSpec[1].socket).emit('endGameCallback', await this.game.getPlayingGames());

		this.emitToInterface(1, 'updateGamesList', await this.game.getGamesLists());
		await this.updateUsersStatusFromGameUserSock(playersAndSpec, userStatus.GAMESTARTPAGE);

		await this.removeAllSockFromGameChat(client.data.gameID);
	}

	@SubscribeMessage('LeaveGame')
	async disconnectUserFromLobby(client: Socket) {
		logger();
		if (client.data.player) 
			logger('player:', client.data.player);

		if (client.data.player !== 'A' && client.data.player !== 'B')
			return;

		if (!client.data.gameID || !await this.game.findGameByID(client.data.gameID))
			return;

		var sock = await this.game.getSocketsPlayersFromGameID(client.data.gameID)
		if (!sock || sock.length === 0)
			return;

		if (client.data.player === 'B') {
			this.game.setPlayerStatus(client.data.gameID, playersStatus.NONE);
			this.emitToPlayerA(client.data.gameID, 'LeaveGame-playerB', undefined);
			await this.deletePlayerFromGame(client);

		} else if (client.data.player === 'A') {
			logger('A')
			if (sock.length > 1) {
				this.emitToPlayerB(client.data.gameID, 'LeaveGame-playerA', sock[1].iduser);
			}
			await this.updateUsersStatusFromGameUserSock(sock, userStatus.GAMESTARTPAGE);
			this.emitToPlayersAndSpec(client.data.gameID, 'updateSocketPlayerInfo', { pos: '0', gameID: 0 });

			await this.removeAllSockFromGameChat(client.data.gameID);

			await this.game.deleteGame(client.data.gameID);
			this.server.except(client.id).emit('deleteGameCallback', await this.game.getWaitingGame());

		}
		this.emitToOne(client.id, 'LeaveGameCallback', null);
		this.emitToInterface(1, 'updateGamesList', await this.game.getGamesLists())
	}


	@SubscribeMessage('leavingSpectator')
	async onLeavingSpectator(client: Socket) {
		logger()
		if (!client.data.gameID || client.data.player != 'SPECTATOR')
			return
		await this.deletePlayerFromGame(client);
		this.emitToServerInstance(client.data.gameID, 'updatePlayersAndSpectList', null);
	}

	async deletePlayerFromGame(client: Socket) {
		await this.updateUserStatus(client.data.user.id, userStatus.GAMESTARTPAGE);

		await this.game.deleteUserFromGame(client.id);

		this.emitToOne(client.id, 'destroyChat', null);
		await this.sock.changeSocketGameChatID(client.id, -1);

		this.emitToOne(client.id, 'updateSocketPlayerInfo', { pos: '0', gameID: 0 });
	}



//////////////////////////////////////////////////////////////////////////////////////////
// MP
//////////////////////////////////////////////////////////////////////////////////////////


	@SubscribeMessage('createMpRoom')
	async onCreateMP(socket: Socket, data: CreateMpRoomDto) {
		const mp = await this.mp.createMpRoom(data)

		this.emitToUserOpenPopUp(data.iduser1, 'updateMpList', await this.mp.getMpList(data.iduser1))
		this.emitToUserOpenPopUp(data.iduser2, 'updateMpList', await this.mp.getMpList(data.iduser2))

	}

	@SubscribeMessage('changeMpRoom')
	async onChangeMP(socket: Socket, data) {
		const sock = await this.sock.getSocketBySocketID(socket.id)
		await this.sock.changeMpID(sock.id, data.mpID)

		this.emitToOne(socket.id, 'changeMpRoom', { MpMsg: await this.mp.getMpMsg(data.mpID), MpID: data.mpID })
	}


	@SubscribeMessage('addMpMsg')
	async onAddMPmsg(socket: Socket, data: InsertMpDto) {
		const msg = await this.mp.insert(data)
		const secondUserID = await this.mp.findSecondUserID(data.idmp, socket.data.user.id)

		this.emitToMpID(data.idmp, 'addMpMsg', msg)
		if (await this.blacklist.isBlocked(socket.data.user.id, secondUserID) === false)
			this.notifUser(secondUserID, { type: 'green', msg : 'you have a new message from ' + socket.data.user.name }, data.idmp)
	}


	@SubscribeMessage('updateMpList')
	async onUpdateMPlist(socket: Socket) {
		this.emitToOne(socket.id, 'updateMpList', await this.mp.getMpList(socket.data.user.id))
	}

	@SubscribeMessage('updateAvailableContacts')
	async onUpdateAvailableContacts(socket: Socket) {
		if (socket.data && socket.data.user && socket.data.user.id && socket.id)
			this.emitToOne(socket.id, 'updateAvailableContacts', await this.mp.getAvailableContacts(socket.data.user.id))
	}




//////////////////////////////////////////////////////////////////////////////////////////
// PROFIL
//////////////////////////////////////////////////////////////////////////////////////////


	@SubscribeMessage('updatedProfil')
	async onUpdatedProfile(socket: Socket) {
		logger()
		
		const userID = socket.data.user.id
		socket.data.user = await this.userService.getUserById(userID)

		this.emitToUser(userID, 'updatedProfil', socket.data.user)

		for (const chat of await this.chatUser.getChatList(userID))
			this.emitToChatID(chat.id, 'updateChatUsersList', await this.chatUser.getUserDetailFromChat(chat.id))

		for (const blockerSock of await this.sock.getFriendsSocketsOfUser(userID)) {
			this.emitToOne(blockerSock.socketid, 'getBlockedList', await this.blacklist.getBlockedandNonBlockedList(blockerSock.iduser))
		}

		for (const friendSock of await this.sock.getFriendsSocketsOfUser(userID)) {
			this.emitToOne(friendSock.socketid, 'getFriendList', await this.friend.getFriendandNonFriendList(friendSock.iduser))
		}

		this.emitToServer('updateStatusList', await this.userService.getAllStatusUsers())	
	}

	@SubscribeMessage('getUserById')
	async onUserById(socket: Socket, id:number) {
		socket.emit("fgetUserById", await this.userService.getUserById(id))
		
	}



	@SubscribeMessage('getUserStat')
	async onGetUserStat(socket: Socket, iduser: number) {
		socket.emit("getUserStat", await this.statService.getUserStat(iduser));
	}

	@SubscribeMessage('getAllUserStat')
	async onGetAllUserStat(socket: Socket, iduser: number) {
		socket.emit("getAllUserStat", await this.statService.getAllUserStat());
	}

	@SubscribeMessage('getAllUserStatSorted')
	async onGetAllUserStatSorted(socket: Socket, iduser: number) {
		socket.emit("getAllUserStatSorted", await this.statService.getAllUserStatSorted());
	}

	@SubscribeMessage('getUserGameHistory')
	async onGetUserGameHistory(socket: Socket, iduser: number) {
		socket.emit("getUserGameHistory", await this.game.getUserHistory(iduser));
	}


	@SubscribeMessage('getGameUserIn')
	async onGetGameUserIn(socket: Socket, iduser: number) {
		socket.emit("getGameUserIn", (await this.game.getGameUserSocketBySockID(socket.id)).idgame);
	}


//////////////////////////////////////////////////////////////////////////////////////////
// RELATIONS
//////////////////////////////////////////////////////////////////////////////////////////


	@SubscribeMessage('addFriend')
	async onAddFriend(socket: Socket, friendID: number) {
		logger()
		if (await this.blacklist.isBlocked(socket.data.user.id, friendID) === true
				|| await this.blacklist.isBlocked(friendID, socket.data.user.id) === true) {
			this.notifUser(socket.data.user.id, { type: 'red', msg: 'you need to unblock user first'})
			return
		}


		await this.friend.insert({ idUser: socket.data.user.id, idAddUser: friendID })

		const friend = await this.userService.getUserById(friendID)

		this.emitToUser(socket.data.user.id, 'getFriendList', await this.friend.getFriendandNonFriendList(socket.data.user.id))
		this.emitToUser(friend.id, 'getFriendList', await this.friend.getFriendandNonFriendList(friend.id))

		this.notifUser(socket.data.user.id, { type: 'green', msg: 'you have a new friend: ' + friend.name })
		this.notifUser(friend.id, { type: 'green', msg: 'you have a new friend: ' + socket.data.user.name})
	}

	@SubscribeMessage('removeFriend')
	async onRemoveFriend(socket: Socket, friendID: number) {
		await this.friend.delete({ idUser: socket.data.user.id, idAddUser: friendID })

		const friend = await this.userService.getUserById(friendID)

		this.emitToUser(socket.data.user.id, 'getFriendList', await this.friend.getFriendandNonFriendList(socket.data.user.id))
		this.emitToUser(friend.id, 'getFriendList', await this.friend.getFriendandNonFriendList(friend.id))

		this.notifUser(socket.data.user.id, { type: 'red', msg: 'you lost a friend: ' + friend.name})
		this.notifUser(friend.id, { type: 'red', msg: 'you lost a friend: ' + socket.data.user.name})
	}

	@SubscribeMessage('blockUser')
	async onBlockUser(socket: Socket, targetID: number) {
		logger()
		const areFriends = await this.friend.areFriends(socket.data.user.id, targetID)
		if (areFriends) {
			await this.onRemoveFriend(socket, targetID)
		}

		await this.blacklist.insert({ idUser: socket.data.user.id, idUserToBlock: targetID })

		const target = await this.userService.getUserById(targetID)
		
		this.emitToUser(socket.data.user.id, 'getBlockedList', await this.blacklist.getBlockedandNonBlockedList(socket.data.user.id))
		
		this.emitToUser(socket.data.user.id, 'updateMpList', await this.mp.getMpList(socket.data.user.id))
		this.notifUser(socket.data.user.id, { type: 'red', msg: 'you blocked: ' + target.name })
	}

	@SubscribeMessage('UnBlockUser')
	async onUnBlockUser(socket: Socket, targetID: number) {
		await this.blacklist.delete({ idUser: socket.data.user.id, idUserToBlock: targetID })

		const target = await this.userService.getUserById(targetID)

		this.emitToUser(socket.data.user.id, 'getBlockedList', await this.blacklist.getBlockedandNonBlockedList(socket.data.user.id))
		
		this.emitToUser(socket.data.user.id, 'updateMpList', await this.mp.getMpList(socket.data.user.id))
		this.notifUser(socket.data.user.id, { type: 'green', msg: 'you unblocked: ' + target.name })
	}

	@SubscribeMessage('getFriendList')
	async onGetFriendList(socket: Socket) {
		this.emitToOne(socket.id, 'getFriendList', await this.friend.getFriendandNonFriendList(socket.data.user.id))
	}

	@SubscribeMessage('getBlockedList')
	async onGetBlockedList(socket: Socket) {
		this.emitToOne(socket.id, 'getBlockedList', await this.blacklist.getBlockedandNonBlockedList(socket.data.user.id))
	}


}
