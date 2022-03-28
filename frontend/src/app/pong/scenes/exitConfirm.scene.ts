import { Socket } from "socket.io-client";

export class exitConfirmScene extends Phaser.Scene{
	keys: Phaser.Types.Input.Keyboard.CursorKeys;
	text: Phaser.GameObjects.Text;

	sceneToLaunch: string;
	sceneFrom: string;
	gameID: number;
	playerID: number;

	/* Client http */

	socket: Socket;

    constructor ()
    {
        super({key : 'exit-confirm'});
    }


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	init(data: any): void {
        this.sceneToLaunch = data.scene;
		this.sceneFrom = data.sceneFrom;
		if (data.gameID)
			this.gameID = data.gameID;
		if (data.socket)
			this.socket = data.socket;
		if (data.playerID)
			this.playerID = data.playerID;


		this.socket.once('LeaveGame-playerA', (playerID: number) => {
			this.socketOff();
			this.scene.stop('exit-confirm');
		});
    }

	preload(): void {
		this.load.image('return', 'assets/returnButton_03.png');
		this.load.image('container', 'assets/menu-container.png');
		this.load.image('container-hover', 'assets/container-green.png');
		this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
		this.load.bitmapFont('arcade_blue', 'assets/fonts/arcade_blue.png', 'assets/fonts/arcade_blue.xml');
		this.load.image('cadre', 'assets/cadre-darkblue.png');
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
    create () {
		const   { width, height } = this.scale;
		this.keys = this.input.keyboard.createCursorKeys();

		this.add.rectangle(0, 0, width, height, 0x111111, 0.9).setOrigin(0, 0).setInteractive();

		let cadre = this.add.image(width * 0.5, height * 0.5, 'cadre').setDisplaySize(width / 1.8, height / 1.8);
	    this.add.bitmapText(cadre.x, cadre.y - 40, 'arcade', 'Leave ?').setOrigin(0.5).setFontSize(30);

		let yesButton = this.add.image(cadre.x * 0.7, cadre.y * 1.3, 'container').setDisplaySize(150, 80);
        this.add.bitmapText(yesButton.x, yesButton.y, 'arcade', 'Yes').setOrigin(0.5).setFontSize(20);
		let noButton = this.add.image(cadre.x * 1.3, cadre.y * 1.3, 'container').setDisplaySize(150, 80);
        this.add.bitmapText(noButton.x, noButton.y, 'arcade', 'No').setOrigin(0.5).setFontSize(20);

		yesButton.setInteractive();
        noButton.setInteractive();


		yesButton.on("pointerover", () => {
			yesButton.setTexture('container-hover');
		});

		yesButton.on("pointerout", () => {
			yesButton.setTexture('container');
		});

		yesButton.on('pointerup', () => {
			if (this.sceneFrom === "create-custom") {
				this.deleteGame();
			}
			this.socketOff();
			this.scene.stop(this.sceneFrom);
            this.scene.start(this.sceneToLaunch, {
				'socket': this.socket,
				'gameID': this.gameID,
				'playerID': this.playerID
			});
		});

		noButton.on("pointerover", () => {
			noButton.setTexture('container-hover');
		});

		noButton.on("pointerout", () => {
			noButton.setTexture('container');
		});

        noButton.on('pointerup', () => {
            this.scene.stop('exit-confirm');
			this.scene.resume(this.sceneFrom);
        });

	}

	
/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	deleteGame() {
		this.socket.emit('LeaveGame', this.gameID);
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
