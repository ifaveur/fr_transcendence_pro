import { Socket } from 'socket.io-client';

const DARK_BLUE = 0x020E12;

export class endGame extends Phaser.Scene {

	/* Variables */
	socket: Socket;

	playerA: string;
	playerB: string;
	thisPlayerID: number;

	scoreA: number;
	scoreB: number;

	textOne: Phaser.GameObjects.BitmapText;
	textTwo: Phaser.GameObjects.BitmapText;

	trophy: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;


	constructor() {
		super('endgame');
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	init(data: any): void {
		this.socket = data.socket;

		this.playerA = data.playerA_name;
		this.playerB = data.playerB_name;
		this.thisPlayerID = data.playerID;
		this.scoreA = data.playerA_score;
		this.scoreB = data.playerB_score;
	}

	preload() {
		this.load.image('return', 'assets/returnButton_03.png');
		this.load.image('container', 'assets/menu-container.png');
		this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
		this.load.bitmapFont('arcade_blue', 'assets/fonts/arcade_blue.png', 'assets/fonts/arcade_blue.xml');
		this.load.image('trophy', 'assets/trophy.png');
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	create () {
		const { width, height } = this.scale;

		this.add.rectangle(0, 0, width, height, DARK_BLUE).setOrigin(0);
		let displayWinner: string;
		let displayScore: string;

		if (this.scoreA === this.scoreB) {
			displayWinner = "Equality !";
		} else if (this.scoreA < this.scoreB) {
			displayWinner = this.playerB + ` wins !\n`;
		} else {
			displayWinner = this.playerA + ` wins !\n`;
		}
		displayScore = `${this.scoreA} - ${this.scoreB}`;

		this.trophy = this.physics.add.image(width / 2, height * 0.25, 'trophy').setOrigin(0.5).setDisplaySize(80, 100);
		this.textOne = this.add.bitmapText(width / 2, height / 2 - 40, 'arcade_blue', displayWinner).setOrigin(0.5).setFontSize(40);
		this.textTwo = this.add.bitmapText(width / 2, height / 2 + 20, 'arcade',displayScore).setOrigin(0.5);

		let backToMenu = this.add.rectangle(this.sys.canvas.width / 2, this.sys.canvas.height / 2 + 80, 100, 50, 0xffffff, 0.6);
		this.add.bitmapText(backToMenu.x, backToMenu.y, 'arcade_blue','HOME').setOrigin(0.5).setFontSize(15);

		backToMenu.setInteractive();
		backToMenu.on("pointerover", () => {
			backToMenu.fillAlpha = 1;
		});

		backToMenu.on("pointerout", () => {
			backToMenu.fillAlpha = 0.6;
		});

		backToMenu.on("pointerup", () => {
			this.scene.stop('endgame');
			this.socketOff();

			this.scene.start("main-menu", {
				"playerID": this.thisPlayerID,
				"socket": this.socket
			});
		});

		this.socket.on('updateSocketPlayerInfo', (data: { pos: string, gameID: number }) => {
            this.socket.emit('updateSocketPlayerInfo', data);
        });
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
