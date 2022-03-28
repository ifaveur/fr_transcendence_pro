import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { JSDOM } from 'jsdom'
import { join } from 'path';
import { SocketService } from 'src/user/socket/socket.service';
import { UserService } from 'src/user/user/user.service';
import { gameMode, gameStatus, playersStatus } from "src/db/entities/game.entity";
import { SimpleGameDataDtoTwoPlayer } from './dto/create_game.dto';
import { MasterGateway } from 'src/chat/gateway/master.gateway';
import { ChatUserService } from 'src/chat/chat_user/chat_user.service';
import { logger } from 'src/global-var/global-var.service';
import { userStatus } from 'src/db/entities/user.entity';
import { GameChatService } from 'src/game_chat/game_chat/game_chat.service';
import { GameChatMsgService } from 'src/game_chat/game_chat_msg/game_chat_msg.service';
import { StatService } from 'src/user/stat/stat.service';
import { Cron } from '@nestjs/schedule';
import { MatchMakingService } from './matchmaking.service';

const DataURIParser = require('datauri/parser');

const datauri = new DataURIParser();


function launchGameServer() {
	JSDOM.fromFile(join(process.cwd(), 'src/game/index-game.html'), {
		url: 'REPLACE_DOMAIN',
		// To run the scripts in the html file
		runScripts: "dangerously",
		// Also load supported external resources
		resources: "usable",
		// So requestAnimatinFrame events fire
		pretendToBeVisual: true
	  }).then((dom) => {
		dom.window.URL.createObjectURL = (blob: Blob) => {
			if (blob){
			  return datauri.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
			}
		};
		dom.window.URL.revokeObjectURL = (objectURL) => { };
	  });
}

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway extends MasterGateway {

	@WebSocketServer()
	server: Server;

	constructor(
		chatUser: ChatUserService,
		user: UserService,
		sock: SocketService,
		game: GameService,
		gameChat: GameChatService,
		private gameChatmsg: GameChatMsgService,
		private statService: StatService,
		private matchMaking: MatchMakingService
	) {
		super(user, sock, chatUser, game, gameChat)
	}

	async onModuleInit(socket: Socket) {
		await this.gameChat.deleteAllChats();
		await this.game.deleteAllGames();
		await this.matchMaking.deleteAll()
	}

	public afterInit(server: Server): void {

	}

	@SubscribeMessage('connectInstanceToGame')
	async onConnectInstanceToGame(serverInstance: Socket) {
		logger();

		var game = await this.game.getWaitingGameForServer();


		// protection if user leave on game launching
		if (!game || game.length === 0 ||  (await this.game.getSocketsPlayersFromGameID(game[game.length - 1].id)).length != 2) {
			logger('ERROR', 'error no game found')
			this.emitToOne(serverInstance.id, 'endserver', null)
			return
		}

		serverInstance.data.player = 'SERVER INSTANCE'
		serverInstance.data.gameID = game[game.length - 1].id;

		await this.onUpdatePlayersAndSpectList(serverInstance);

		this.onJoinGame(serverInstance, game[game.length - 1].id);
	}

	@SubscribeMessage('move')
	async handleMove(client: Socket, data: {val: number, idgame: number}){
		if (!client.data
			|| client.data.servInstSockID === undefined
			|| client.data.servInstSockID === 0) {
				try {
					client.data.servInstSockID = (await this.game.getServerInstance(data.idgame)).socket;
				} catch {
					client.data.servInstSockID = 0;
					return;
				}
		}

		if (client.data.player === 'A')
			this.server.to(client.data.servInstSockID).emit('moveA', data.val);
		else if (client.data.player === 'B')
			this.server.to(client.data.servInstSockID).emit('moveB', data.val);
	}

	@SubscribeMessage('HeadlessValues')
	handleHeadlessValues(servInstance: Socket, data: string) {
		this.emitToStringTabSockets(servInstance.data.sockets, 'update', data);
	}

	
	@SubscribeMessage('CreateGame')
	async onCreateGame(client: Socket) {
		logger();

		const game = await this.game.createGame({
			idUser: client.data.user.id,
			gameMode : gameMode.ADVANCE,
			socketid: client.id
		});
		if (!game) {
			logger('ERROR', 'error no game found, DONT FORGET TO IMPLEMENT THE FRONT PART')
			this.emitToOne(client.id, 'ERROR_REDIRECT', null)
			return
		}

		this.emitToOne(client.id, 'updateSocketPlayerInfo', { pos: 'A', gameID: game.id });

		const gameUsers: SimpleGameDataDtoTwoPlayer = await this.game.joinUserDataOfGame(game.id);
		this.emitToOne(client.id, 'createGameCallback', gameUsers);
		await this.userService.updateStatus(client.data.user.id, userStatus.GAMESTARTPAGE);

		this.server.except(client.id).emit('createdOneGameCallback', await this.game.getWaitingGame());


		// gameChat /////////////////////////////////////////////////////////////
		const gameChat = await this.gameChat.create(game.id);
		if (gameChat) {
			await this.sock.changeSocketGameChatID(client.id, gameChat.id);
			this.emitToOne(client.id, 'createdGameChat', gameChat.id);
		}
		//////////////////////////////////////////////////////////////////////
		this.emitToInterface(1, 'updateGamesList', await this.game.getGamesLists());
		return game;
	}

	@SubscribeMessage('FindGameByID')
	async onFindGameByID(client: Socket, gameID: number) {
		const game: SimpleGameDataDtoTwoPlayer = await this.game.joinUserDataOfGame(gameID);
		this.emitToOne(client.id, 'FindGameByIDCallback', game);
	}

	@SubscribeMessage('JoinGame')
	async onJoinGame(client: Socket, gameID: number) {
		if (client.data.player !== 'SERVER INSTANCE')
			logger('Game ID : ' + gameID + ' | User ID : ' + client.data.user.id);
		else
			logger('Game ID : ' + gameID + ' SERVER INSTANCE'.magenta);


		if (client.data.player === 'SERVER INSTANCE'){
			try {
				var game = await this.game.getGameByID(gameID);
				if (!game
					|| (await this.game.getSocketsPlayersFromGameID(game.id)).length != 2
					|| game.status === gameStatus.FINISH)
						throw new Error;

				await this.game.serverJoinGame({ idGame: gameID, socketid: client.id });

				await this.game.setGameStatus(gameID, gameStatus.INPROGRESS);
				this.server.emit('launchGameCallback', await this.game.getPlayingGames());
				this.emitToServerInstance(gameID, 'options', (await this.game.findGameByID(gameID)).options) // Send Game Options to server
				var game = await this.game.getGameByID(gameID);
				const socketPlayers = await this.game.getSocketsPlayersFromGameID(gameID);
				if (!game
					|| !socketPlayers
					|| socketPlayers.length != 2
					|| game.status === gameStatus.FINISH)
						throw new Error;

				this.updateUsersStatus([socketPlayers[0].iduser, socketPlayers[1].iduser], userStatus.INGAME);

				this.emitToInterface(1, 'updateGamesList', await this.game.getGamesLists());
			} catch {
				logger('ERROR', 'error0001 no game found');
				this.emitToOne(client.id, 'endserver', null);
			}
		} else {
			try {
				await this.game.userJoinGame({
					idUser: client.data.user.id,
					idGame: gameID,
					socketid: client.id
				})
				this.emitToOne(client.id, 'updateSocketPlayerInfo', { pos: 'B', gameID: gameID });

				const game: SimpleGameDataDtoTwoPlayer = await this.game.joinUserDataOfGame(gameID);
				if (!game)
					throw new Error;
					
				const gameChat = await this.gameChat.getChatId(game.id);
				if (gameChat) {
					await this.sock.changeSocketGameChatID(client.id, gameChat.id);
					this.emitToPlayerB(gameID, 'joinedGameChat', {
						msg: await this.gameChatmsg.getMessageFromChat(gameChat.id),
						id: gameChat.id
					});
				}

				this.emitToPlayerA(gameID, 'JoinGameCallbackA', game.iduser2);
				this.emitToPlayerB(gameID, 'JoinGameCallbackB', null);

				if (!gameChat || !(await this.game.getGameByID(gameID)))
					throw new Error;
				this.emitToInterface(1, 'updateGamesList', await this.game.getGamesLists());
			} catch {
				this.emitToOne(client.id, 'ERROR_REDIRECT', null);
				try {
					await this.game.deleteUserFromGame(client.id);
				} catch {}
				await this.sock.changeSocketGameChatID(client.id, -1);
				this.emitToOne(client.id, 'updateSocketPlayerInfo', { pos: '0', gameID: 0 });
			}
		}
	}

	@SubscribeMessage('GameWaitingList')
	async onGameWaitingList(client: Socket){
		logger();
		this.emitToOne(client.id, 'GameWaitingListCallback', await this.game.getWaitingGame());
	}


	@SubscribeMessage('GameStart')
	async onGameStart(client: Socket, data: any) {
		logger('Game ID : ', data.gameID);
		 try {
			if ((await this.game.getPlayerStatus(data.gameID)) === playersStatus.NONE) {
				await this.game.setPlayerStatus(data.gameID, playersStatus.ONE);
				return ;
			}

			await this.game.setPlayerStatus(data.gameID, playersStatus.BOTH);
			await this.game.setGameOptions(data.gameID, data.options);

			const sockets = await this.game.getSocketsPlayersFromGameID(data.gameID);
			if ((sockets && sockets.length === 2)) {
				launchGameServer();
				this.emitToPlayers(data.gameID, 'GameStartCallback', null);
			}
			else
				throw new Error;	
		}
		catch {}
	}


	@SubscribeMessage('GameStart_cancel')
	async onGameStartCancel(client: Socket, gameID: number) {
		logger('Game ID : ', gameID);

		if (await this.game.getPlayerStatus(gameID) === playersStatus.ONE) {
			this.game.setPlayerStatus(gameID, playersStatus.NONE);
		}
	}

	@SubscribeMessage('HeadlessNewScore')
	handleHeadlessNewScore(servInstance: Socket, data: string){
		this.emitToStringTabSockets(servInstance.data.sockets, 'updatescore', data);
	}

/* ******************************************************** */
/* *************************PAUSE************************** */
/* ******************************************************** */

	@SubscribeMessage('pauseRequest')
	async handlePauseRequest(client: Socket, gameID: number) {
		logger();
		if (!client.data.gameID
			|| !client.data.user
			|| (client.data.player != 'A' && client.data.player != 'B'))
				return

		this.emitToServerInstance(gameID, 'pauseServer', {
			PlayerName: client.data.user.name,
			side: client.data.player === 'A' ? 'left': 'right'
		});
	}

	@SubscribeMessage('pauseConfirmed')
	async handlePauseConfirmed(servInstance: Socket, data) {
		logger();

		this.emitToPlayers(servInstance.data.gameID, 'pause', {
			PlayerName: data[0],
			PauseA: data[1],
			PauseB: data[2]
		});
	}

	@SubscribeMessage('resumeRequest')
	async handleResumeRequest(client: Socket, gameID: number) {
		logger();

		this.emitToServerInstance(gameID, 'resume', null);
		this.emitToPlayersAndSpec(gameID, 'resume', null);
	}

	@SubscribeMessage('InvitePlayer')
	async onInvitePlayer(clientA: Socket, data: { gameID: number, playerBID: number }) {
		if ((await this.userService.getUserById(data.playerBID)).status != userStatus.OFFLINE) {
			//On vérifie que l'user n'est pas en game ou dans un lobby
			const games = await this.game.getExistingGameByUserID(clientA.data.user.id);
			if (games.find(e => e.iduser === data.playerBID &&
				(e.status === gameStatus.INWAITING
				|| e.status === gameStatus.INPROGRESS
				|| e.status === gameStatus.MATCHMAKING))) {
				this.emitToOne(clientA.id, 'InvitePlayerFailed', null);
			} else {
				this.emitToUser(data.playerBID, 'InvitePlayerCallback', {
					PlayerA: clientA.data.user,
					socketPlayerA: clientA.id,
					gameID: data.gameID
				})
				this.emitToOne(clientA.id, 'InvitePlayerSent', null);
			}
		} else {
			this.emitToOne(clientA.id, 'InvitePlayerFailed', null);
		}
	}

	@SubscribeMessage('InvitationDeclined')
	async onRefuseInvitation(clientB: Socket, playerASocketID: string) {
		logger()

		this.emitToOne(playerASocketID, 'InvitationDeclinedCallback', await this.userService.getUserById(clientB.data.user.id));
	}

	@SubscribeMessage('InvitationAccepted')
	async onAcceptInvitation(client: Socket, playerASocketID: string) {
		logger()

		this.emitToOne(playerASocketID, 'InvitationAcceptedCallback', {
			playerBsocketID: client.id,
			playerB: await this.userService.getUserById(client.data.user.id)
		});
	}



	/* SERVER INSTANCE ONLY */
	// call this function on each new player, and new spectator to update the list to emit
    @SubscribeMessage('updatePlayersAndSpectList')
    async onUpdatePlayersAndSpectList(servInstance: Socket) {
        const gameSockets = await this.game.getSocketsPlayersFromGameID(servInstance.data.gameID);
        if (!gameSockets || gameSockets.length === 0)
            return;
        var sockets = [];
        for (const gameSock of gameSockets)
            sockets.push(gameSock.socket);
        servInstance.data.sockets = sockets;
    }

	@SubscribeMessage('newSpectator')
	async onNewSpectator(spectatorSocket: Socket, data) {
		logger();

		try {
			await this.game.userJoinGame({
				idUser: spectatorSocket.data.user.id,
				idGame: data.GameID,
				socketid: spectatorSocket.id
			});

			this.emitToServerInstance(data.GameID, 'updatePlayersAndSpectList', null);
	
			this.emitToOne(spectatorSocket.id, 'updateSocketPlayerInfo', { pos: 'SPECTATOR', gameID: data.GameID });
			this.updateUserStatus(spectatorSocket.data.user.id, userStatus.SPECTATOR);
	
			const gameChat = await this.gameChat.getChatId(data.GameID);

			if (gameChat) {
				this.emitToOne(spectatorSocket.id, 'joinedGameChat', {
					msg: await this.gameChatmsg.getMessageFromChat(gameChat.id),
					id: gameChat.id
				});
				await this.sock.changeSocketGameChatID(spectatorSocket.id, gameChat.id);
			}
			const gameInfo = await this.game.getDataOfGameUsers(data.GameID);
			let playerA: string = await this.game.getUsernameById(gameInfo[0].iduser);
			let playerB: string = await this.game.getUsernameById(gameInfo[1].iduser);
			let options = (await this.game.findGameByID(data.GameID)).options;
			this.emitToOne(spectatorSocket.id, 'StartToSpectate', {playerA_name: playerA, playerB_name: playerB, playerA_id: gameInfo[0].iduser, playerB_id: gameInfo[1].iduser, options: options});
	
			// protection if game is finishing when joining
			const game = await this.game.getGameByID(data.GameID)
			if (!game || game.status === gameStatus.FINISH || (await this.game.getSocketsPlayersFromGameID(data.GameID)).length < 2)
				throw new Error;
		} catch {
			logger('ERROR', 'error no game found')
			this.emitToOne(spectatorSocket.id, 'updateSocketPlayerInfo', { pos: '0', gameID: 0 });
			const gameChat = await this.gameChat.getChatId(data.GameID);
			if (gameChat) {
				await this.sock.changeSocketGameChatID(spectatorSocket.id, -1);
			}
			await this.updateUserStatus(spectatorSocket.data.user.id, userStatus.GAMESTARTPAGE);
			this.emitToOne(spectatorSocket.id, 'ERROR_REDIRECT', null);
		}
	}

/* ******************************************************** */
/* *********************  JOIN FROM URL******************** */
/* ******************************************************** */

	@SubscribeMessage('getGameData')
	async onGetGameDate(client: Socket, idGame: number){
		logger();

		this.emitToOne(client.id, 'getGameData', await this.game.GetDataUserByGame(idGame));
	}

	
/* ******************************************************** */
/* *********************  SPECTATE  *********************** */
/* ******************************************************** */
	@SubscribeMessage('GamePlayingList')
	async onGamePlayingList(client: Socket){
		logger();

		this.emitToOne(client.id, 'GamePlayingListCallback', await this.game.getPlayingGames());
	}

	@SubscribeMessage('updateGamesList')
	async onUpdateGamesList(client: Socket) {
		this.emitToOne(client.id, 'updateGamesList', await this.game.getGamesLists());
	}


/* ******************************************************** */
/* *******************  MATCHMAKING  ********************** */
/* ******************************************************** */
	@SubscribeMessage('searchMatchmaking')
	async onSearchMatchmaking(client: Socket) {
		logger();
		if (!client.data || !client.data.user || !client.data.user.id)
			return;
			
		if ((await this.matchMaking.getByUserID(client.data.user.id)) !== undefined) {
			return ;
		}

		this.matchMaking.insert(client.id, client.data.user.id);
		this.updateUserStatus(client.data.user.id, userStatus.MATCHMAKING);
	}

	@Cron('*/5 * * * * *')
	async checkMatchMaking() {
		const waitingPlayers = await this.matchMaking.getAll()
		if (waitingPlayers.length < 2)
			return ;

		logger('[ m a t c h M a k i n g  Found ]'.rainbow.bold);
		this.emitToOne(waitingPlayers[0].socket,'matchMakingFound', null);
		this.emitToOne(waitingPlayers[1].socket,'matchMakingFound', null);

		const game = await this.makeGame({
				id: waitingPlayers[0].iduser,
				socket: waitingPlayers[0].socket
			},
			{
				id: waitingPlayers[1].iduser,
				socket: waitingPlayers[1].socket
			});
		try {
			this.game.setGameStatus(game.id, gameStatus.MATCHMAKING);

			let playerA = await this.userService.getUserById(waitingPlayers[0].iduser);
			let playerB = await this.userService.getUserById(waitingPlayers[1].iduser);

			this.emitToPlayers(game.id, 'matchMakingReady', {
				playerA_ID: waitingPlayers[0].iduser,
				playerB_ID: waitingPlayers[1].iduser,
				playerA_name: playerA.name,
				playerB_name: playerB.name,
				gameID: game.id
			});

			////// GAMECHAT //////
			const gameChat = await this.gameChat.create(game.id);
			await this.sock.changeSocketGameChatID(waitingPlayers[0].socket, gameChat.id)
			this.emitToPlayerA(game.id, 'createdGameChat', gameChat.id);
			await this.sock.changeSocketGameChatID(waitingPlayers[1].socket, gameChat.id)
			this.emitToPlayerB(game.id, 'joinedGameChat', {
				msg: await this.gameChatmsg.getMessageFromChat(gameChat.id),
				id: gameChat.id
			})


			// delete two matchmakingEntities since they are not in queue anymore
			this.matchMaking.deleteByUserID(waitingPlayers[0].iduser);
			this.matchMaking.deleteByUserID(waitingPlayers[1].iduser);
			launchGameServer();
			if (!(await this.sock.getSocketBySocketID(waitingPlayers[0].socket))
				||!(await this.sock.getSocketBySocketID(waitingPlayers[1].socket)))
					throw new Error;
		} catch {
			logger('ERROR', 'error player left when creating game');
			const gameChat = await this.gameChat.getChatId(game.id);
			if (gameChat)
				await this.gameChat.deleteChatbyid(gameChat.id);
			await this.sock.changeSocketGameChatID(waitingPlayers[0].socket, -1);
			await this.sock.changeSocketGameChatID(waitingPlayers[1].socket, -1);
			await this.updateUsersStatus([waitingPlayers[0].iduser, waitingPlayers[1].iduser], userStatus.GAMESTARTPAGE);
			if (!(await this.sock.getSocketBySocketID(waitingPlayers[0].socket)))
				this.emitToOne(waitingPlayers[1].socket, 'ERROR_REDIRECT', null);
			if (!(await this.sock.getSocketBySocketID(waitingPlayers[1].socket)))
				this.emitToOne(waitingPlayers[0].socket, 'ERROR_REDIRECT', null);
			if (await this.game.getGameByID(game.id))
				await this.game.deleteGame(game.id);
			this.emitToInterface(1, 'updateGamesList', await this.game.getGamesLists());
		}
	}

	// get the game ready for two players joining via matchmaking
	async makeGame(playerA: {id: number, socket:string}, playerB: {id: number, socket:string}) {
		const game = await this.game.createGame({
			idUser: playerA.id,
			gameMode : gameMode.NORMAL,
			socketid: playerA.socket
		});
		await this.game.userJoinGame({
			idUser: playerB.id,
			idGame: game.id,
			socketid: playerB.socket
		});

		this.emitToPlayerA(game.id, 'updateSocketPlayerInfo', { pos: 'A', gameID: game.id });
		this.emitToPlayerB(game.id, 'updateSocketPlayerInfo', { pos: 'B', gameID: game.id });

		return game;
	}

////////////////////////////////////////////


	@SubscribeMessage('updateSocketPlayerInfo')
	async updateSocketInfo(socket: Socket, data: { pos: string, gameID: number }) {
		logger(socket.data.user.name, 'is now player :', data.pos, 'FLASH');
		socket.data.player = data.pos;
		socket.data.gameID = data.gameID;
		socket.data.servInstSockID = 0;
	}


	//OPTIONS MGMT
	@SubscribeMessage('optionBumperOk')
	async onOptionBumperOk(client: Socket, gameid: number) {
		this.emitToPlayers(gameid, 'optionBumperOkCallback', null);
	}

	@SubscribeMessage('optionBumperNotOk')
	async onOptionBumperNotOk(client: Socket, gameid: number) {
		this.emitToPlayers(gameid, 'optionBumperNotOkCallback', null);
	}

	@SubscribeMessage('optionSpeedOk')
	async onOptionSpeedOk(client: Socket, gameid: number) {
		this.emitToPlayers(gameid, 'optionSpeedOkCallback', null);
	}

	@SubscribeMessage('optionSpeedNotOk')
	async onOptionSpeedNotOk(client: Socket, gameid: number) {
		this.emitToPlayers(gameid, 'optionSpeedNotOkCallback', null);
	}

	@SubscribeMessage('optionExtraBallOk')
	async onOptionExtraBallOk(client: Socket, gameid: number) {
		this.emitToPlayers(gameid, 'optionExtraBallOkCallback', null);
	}

	@SubscribeMessage('optionExtraBallNotOk')
	async onOptionExtraBallNotOk(client: Socket, gameid: number) {
		logger();
		this.emitToPlayers(gameid, 'optionExtraBallNotOkCallback', null);
	}

}
