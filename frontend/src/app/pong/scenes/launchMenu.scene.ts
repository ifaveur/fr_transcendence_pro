import { Socket } from "socket.io-client";
import { IUser } from "src/app/interfaces/user.interface";


export class launchMenu extends Phaser.Scene {

	/* Variables */
	playerID: number;
	socket: Socket;

	isInGame: boolean = false;
	matchMakingButton: Phaser.GameObjects.Image;
	createCustomGameButton: Phaser.GameObjects.Image;
	joinCustomGameButton: Phaser.GameObjects.Image;

	constructor() {
		super({key: 'main-menu'});
	};


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	init(data: any): void {
		this.playerID = data.playerID;
		this.socket = data.socket;
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	preload(): void {
		this.load.image('return', 'assets/returnButton_03.png');
		this.load.image('container', 'assets/menu-container.png');
		this.load.image('container-hover', 'assets/container-green.png');
		this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
		this.load.bitmapFont('arcade_blue', 'assets/fonts/arcade_blue.png', 'assets/fonts/arcade_blue.xml');
		this.load.image('bg', 'assets/star-background-moon.png');
		this.load.image('star', 'assets/star-yellow.png');
		this.load.image('starblue', 'assets/star-blue.png');
		this.load.image('controls', 'assets/key-arrow.png');
		this.load.image('space', 'assets/key-space.png');
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	create(): void {
		const { width, height } = this.scale;
		this.add.image(0,0, 'bg').setScale(0.8).setOrigin(0);

		/*controls*/
		this.add.bitmapText(35, height / 2 - 80, 'arcade','CONTROLS').setFontSize(15).setOrigin(0, 0).setDepth(1);
		let controls = this.add.image(40, height / 2 - 50, 'controls').setOrigin(0, 0).setScale(0.4).setDepth(1);
		let textMove = this.add.bitmapText(controls.x + controls.width - 20, controls.y + 40, 'arcade','move').setFontSize(10).setOrigin(0).setDepth(1);
		let space = this.add.image(controls.x - 15, controls.y + 100, 'space').setOrigin(0).setScale(0.12).setDepth(1);
		this.add.bitmapText(textMove.x, space.y + 5, 'arcade','pause').setFontSize(10).setOrigin(0).setDepth(1);

		//stars
		let stars =[];
		for (let i = 0; i < 3; i++)
			stars.push(this.physics.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'star').setScale(0.8).setOrigin(0));

		for (let i = 0; i < 3; i++)
			stars.push(this.physics.add.image(Phaser.Math.Between(0, width), Phaser.Math.Between(0, height), 'starblue').setScale(0.8).setOrigin(0));

		stars.forEach((element) => {
			element.setVelocityX(Phaser.Math.Between(-15, 15)).setVelocityY(Phaser.Math.Between(-15, 15)).setCollideWorldBounds(true).setBounce(1, 1);
		})

		/* Buttons */
		this.add.bitmapText(this.sys.canvas.width / 2 + 100, this.sys.canvas.height / 2 - 240, 'arcade','START GAME').setFontSize(30).setOrigin(0.5);
		this.matchMakingButton = this.add.image(this.sys.canvas.width / 2 + 100, this.sys.canvas.height / 2 - 130, 'container').setDisplaySize(400, 100);
		this.createCustomGameButton = this.add.image(this.sys.canvas.width / 2 + 100, this.matchMakingButton.y + 115, 'container').setDisplaySize(400, 100);
		this.joinCustomGameButton = this.add.image(this.sys.canvas.width / 2 + 100, this.createCustomGameButton.y + 115, 'container').setDisplaySize(400, 100);
		let spectateButton = this.add.image(this.sys.canvas.width / 2 + 100, this.joinCustomGameButton.y + 115, 'container').setDisplaySize(400, 100);

		/* Button - Matchmaking */
		this.add.bitmapText(this.matchMakingButton.x, this.matchMakingButton.y, 'arcade','Matchmaking').setOrigin(0.5).setFontSize(20);
			this.matchMakingButton.setInteractive();
			this.matchMakingButton.on("pointerover", () => {
				this.matchMakingButton.setTexture('container-hover');
			});

			this.matchMakingButton.on("pointerout", () => {
				this.matchMakingButton.setTexture('container');
			});

			this.matchMakingButton.on("pointerup", () => {
				this.socketOff();
				this.scene.stop('main-menu');
				this.scene.start("matchmaking", {
					"playerID": this.playerID,
					"socket": this.socket
				});
			});


		/* Button - Create a game */
		this.add.bitmapText(this.createCustomGameButton.x, this.createCustomGameButton.y, 'arcade','Create custom Game').setOrigin(0.5).setFontSize(20);

			this.createCustomGameButton.setInteractive();
			this.createCustomGameButton.on("pointerover", () => {
				this.createCustomGameButton.setTexture('container-hover');
			});

			this.createCustomGameButton.on("pointerout", () => {
				this.createCustomGameButton.setTexture('container');
			});

			this.createCustomGameButton.on("pointerup", () => {
				this.socketOff();
				this.scene.stop('main-menu');
				this.scene.start("create-custom", {
					"playerA_ID": this.playerID,
					"socket": this.socket
				});
			});

		/* Button - Join a game */
		this.add.bitmapText(this.joinCustomGameButton.x, this.joinCustomGameButton.y, 'arcade','Join custom Game').setOrigin(0.5).setFontSize(20);

			this.joinCustomGameButton.setInteractive();
			this.joinCustomGameButton.on("pointerover", () => {
				this.joinCustomGameButton.setTexture('container-hover');
			});

			this.joinCustomGameButton.on("pointerout", () => {
				this.joinCustomGameButton.setTexture('container');
			});

			this.joinCustomGameButton.on("pointerup", () => {
				this.socketOff();
				this.scene.stop('main-menu');
				this.scene.start("join-custom", {
					"playerID": this.playerID,
					"socket": this.socket
				});
			});


		/* Button - Spectate */
		this.add.bitmapText(spectateButton.x, spectateButton.y, 'arcade', 'Spectate').setOrigin(0.5).setFontSize(20);

			spectateButton.setInteractive();;
			spectateButton.on("pointerover", () => {
				spectateButton.setTexture('container-hover');
			});

			spectateButton.on("pointerout", () => {
				spectateButton.setTexture('container');
			});

			spectateButton.on("pointerup", () => {
				this.socketOff();
				this.scene.stop('main-menu');
				this.scene.start("spectate", {
					"playerID": this.playerID,
					"socket": this.socket
				});
			});

		// Affichage d'une popup lorsqu'on reçoit une invitation
		this.socket.on('InvitePlayerCallback', (data: {PlayerA: IUser, gameID: number}) => {
			this.scene.pause();
			this.scene.launch('accept-invit', {
				'sceneFrom': 'main-menu',
				'gameID': data.gameID,
				'socket': this.socket,
				'playerID': this.playerID,
				'idPlayerA': data.PlayerA.id
			});
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
