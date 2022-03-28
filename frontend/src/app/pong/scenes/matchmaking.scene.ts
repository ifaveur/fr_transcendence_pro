import { Socket } from "socket.io-client";
import eventsCenter from "./eventCenter";

export class matchmaking extends Phaser.Scene {

	/* Variables */
	private returnButton!: Phaser.GameObjects.Image;

	socket: Socket;
	playerID: number;
	playerSide: string;

	matchFoundGroup: Phaser.GameObjects.Group;


	constructor() {
		super({key: 'matchmaking'});
	};


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	init(data): void {
		this.socket = data.socket;
		this.playerID = data.playerID;

		this.socket.on('updateSocketPlayerInfo', (data: { pos: string, gameID: number }) => {
			this.playerSide = data.pos;
			this.socket.emit('updateSocketPlayerInfo', data);
		});

		this.socket.on('matchMakingFound', () => {
			this.returnButton.removeInteractive();
			this.returnButton.setVisible(false);

			this.matchFound();
		});

		this.socket.on('matchMakingReady', (data) => {
			if (eventsCenter)
				eventsCenter.destroy();
			this.socketOff();

			this.scene.start('main', {
				"playerA_ID": data.playerA_ID,
				"playerB_ID": data.playerB_ID,
				"playerA_name": data.playerA_name,
				"playerB_name": data.playerB_name,
				"gameID": data.gameID,

				"socket": this.socket,
				"playerID" : this.playerID
			});
		});
	}

	preload(): void {
		this.load.image('return', 'assets/returnButton_03.png');
		this.load.image('return-hover', 'assets/returnButton_green.png');
		this.load.image('container', 'assets/menu-container.png');
		this.load.image('container-hover', 'assets/container-green.png');
		this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
		this.load.bitmapFont('arcade_blue', 'assets/fonts/arcade_blue.png', 'assets/fonts/arcade_blue.xml');
		this.load.image('cadre', 'assets/cadre-black.png');
		this.load.image('bg', 'assets/star-background-moon.png');
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	create(): void {
		const { width, height } = this.scale;
		this.add.image(0,0, 'bg').setScale(0.8).setOrigin(0);

		this.returnButton = this.add.image(width * 0.1, height * 0.9, 'return').setDisplaySize(80, 80);
		this.returnButton.setInteractive();
		this.returnButton.on("pointerover", () => {
			this.returnButton.setTexture('return-hover');
		});

		this.returnButton.on("pointerout", () => {
			this.returnButton.setTexture('return');
		});

		this.returnButton.on("pointerup", () => {
			this.socket.emit('cancelMatchmaking');
			this.scene.start('main-menu', {
				"playerID" : this.playerID,
				"socket": this.socket
			});
		});

	this.matchmaking();
}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	matchmaking(): void {
		const { width, height } = this.scale;
		let searching: boolean = false;

		/* Search game button */
		const searchGameButton = this.add.image(width * 0.5, height * 0.5, 'container').setDisplaySize(500, 120);
		const searchGameText = this.add.bitmapText(searchGameButton.x, searchGameButton.y, 'arcade', 'Start searching').setOrigin(0.5).setFontSize(25);

			searchGameButton.setInteractive();
			searchGameButton.on("pointerover", () => {
				searchGameButton.setTexture('container-hover');
			});

			searchGameButton.on("pointerout", () => {
				searchGameButton.setTexture('container');
			});

			searchGameButton.on("pointerup", () => {
				if (searching === false) {
					searching = true;
					searchGameText.setText('Searching...');
					this.socket.emit('searchMatchmaking');
				} else {
					searchGameText.setText('Start searching');
					searching = false;
					this.socket.emit('cancelMatchmaking');
				}
			});
	}

	matchFound(): void {
		this.matchFoundGroup = this.add.group();

		const { width, height } = this.scale;

		/* PopUp */
		const bg = this.add.rectangle(0, 0, width, height, 0x111111, 0.9).setOrigin(0, 0);
		const popUp = this.add.image(width * 0.5, height * 0.5, 'cadre').setDisplaySize(width / 1.5, height / 1.5);
	    const popUpText = this.add.bitmapText(popUp.x, popUp.y * 1.07, 'arcade', 'Found a match').setOrigin(0.5).setFontSize(30);

		this.matchFoundGroup.addMultiple([bg, popUp, popUpText]);
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	socketOff(): void {
		this.socket.off('LeaveGame-playerB');
		this.socket.off('createGameCallback');
		this.socket.off('InvitationDeclinedCallback');
		this.socket.off('InvitePlayerSent');
		this.socket.off('JoinGameCallbackA');
		this.socket.off('JoinGameCallbackB');
		this.socket.off('GameStartCallback');
		this.socket.off('LeaveGame-playerA');
		this.socket.off('deleteGameCallback');
		this.socket.off('LeaveGameCallback');
		this.socket.off('InvitePlayerSent');
		this.socket.off('InvitePlayerFailed');
		this.socket.off('GameWaitingListCallback');
		this.socket.off('createdOneGameCallback');
		this.socket.off('deleteGameCallback');
		this.socket.off('InvitePlayerCallback');
		this.socket.off('StartToSpectate');
		this.socket.off('update');
		this.socket.off('updatescore');
		this.socket.off('endgame');
		this.socket.off('pause');
		this.socket.off('resume');
		this.socket.off('searchMatchmakingCallback');
		this.socket.off('launchGameCallback');
		this.socket.off('endGameCallback');
		this.socket.off('FindGameByIDCallback');
		this.socket.off('updateSocketPlayerInfo');
		this.socket.off('matchMakingFound');
		this.socket.off('matchMakingReady');
	
		this.socket.off('optionBumperOkCallback');
		this.socket.off('optionBumperNotOkCallback');
		this.socket.off('optionSpeedOkCallback');
		this.socket.off('optionSpeedNotOkCallback');
		this.socket.off('optionExtraBallOkCallback');
		this.socket.off('optionExtraBallNotOkCallback');
	}


}
