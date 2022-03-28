
import { Socket } from "socket.io-client";
import { IGame } from "src/app/interfaces/game.interface";
import { ILobbyUser } from "src/app/interfaces/user.interface";
import eventsCenter from "./eventCenter";
import { env } from 'src/app/global';
import axios from "axios";

const DARK_BLUE = 0x020E12;

export class createCustomGame extends Phaser.Scene {

	/* Player variables */
	playerA: ILobbyUser = {id: 0, username: "", picture: ""};
	playerB: ILobbyUser = {id: undefined, username: "", picture: ""};
	thisPlayerID: number;

	/* Game variables */
	socket: Socket;
	gameLobby: IGame = {id: undefined, iduser1: 0, iduser2: 0};

	/* Affichage du playerB */
	displayGroupPlayerB: Phaser.GameObjects.Group;
	avatarB: Phaser.GameObjects.Image;
	inviteButton: Phaser.GameObjects.Image;
	inviteText: Phaser.GameObjects.BitmapText;

	/* Client http */

	optionStarBumper: Phaser.GameObjects.Image;

	/* Options */
	bumperActive: boolean = false;
	optionLightSpeed: Phaser.GameObjects.Image;
	speedActive: boolean = false;
	optionExtraBall: Phaser.GameObjects.Image;
	extraBallActive: boolean = false;
	iconLightSpeed: Phaser.GameObjects.Image;
	iconBumper: Phaser.GameObjects.Image;
	iconExtraBall: Phaser.GameObjects.Image;

	returnButton!: Phaser.GameObjects.Image;
	invitePlayerId: number;
	readyButton!: Phaser.GameObjects.Image;
	waitingText: Phaser.GameObjects.BitmapText;
	isReady: boolean = false;

	constructor() {
		super({key: 'create-custom'});
	};


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	init(data: any): void {
		if (this.textures.exists('avatar_A'))
			this.textures.remove('avatar_A');
		if (this.textures.exists('avatar_B'))
			this.textures.remove('avatar_B');

		this.socket = data.socket;

		this.playerA.id = data.playerA_ID;
		this.playerB.id = data.playerB_ID;
		this.gameLobby.id = data.gameID;

		this.invitePlayerId = data.invitePlayerId;

		this.bumperActive = false;
		this.speedActive = false;
		this.extraBallActive = false;
		this.isReady = false;


		this.socket.once('createGameCallback', (data) => {
			this.gameLobby.id = data['id'];
			this.gameLobby.iduser1 = data['iduser1'];
			this.gameLobby.iduser2 = data['iduser2'];
			if (this.gameLobby.iduser2 === 0) {
				this.playerB.id = undefined;
				this.playerB.username = "";
				this.playerB.picture = "";
			}
				
			this.getPlayerA();
			if (this.invitePlayerId) {
				this.socket.emit('InvitePlayer', { gameID: this.gameLobby.id, playerBID: this.invitePlayerId });
				this.invitePlayerId = 0;
			}
		});


		this.socket.once('FindGameByIDCallback', (data) => {
			this.gameLobby.iduser1 = data['iduser1'];
			this.gameLobby.iduser2 = data['iduser2'];
			this.playerA.id = data['iduser1'];
			this.playerB.id = data['iduser2'];
			this.displayPlayerA();
		});


		this.socket.once('GameStartCallback', () => {
			
			this.scene.stop('create-custom');
			if (eventsCenter)
				eventsCenter.destroy();

			this.socketOff();

			this.scene.start('main', {
				"playerA_ID": this.playerA.id,
				"playerB_ID": this.playerB.id,
				"playerA_name": this.playerA.username,
				"playerB_name": this.playerB.username,
				"gameID": this.gameLobby.id,
				"socket": this.socket,
				"playerID" : this.thisPlayerID,
				"extraBall" : this.extraBallActive,
				"bumpers" : this.bumperActive,
			});
		});


		this.socket.on('JoinGameCallbackA', (iduser2: number) => {
			if (iduser2)
			{
				this.playerB.id = iduser2;
				this.displayGroupPlayerB.destroy(true);
				this.displayGroupPlayerB = this.add.group();
				this.displayPlayerB();
			};
		});

		this.socket.on('InvitePlayerSent', () => {
			if (this.inviteText)
				this.inviteText.setText('Invitation sent');
		});

		this.socket.on('InvitationDeclinedCallback', () => {
			if (this.inviteText)
				this.inviteText.setText('Invitation declined');
			this.time.delayedCall(4000, () => {
				if (!this.playerB.id)
					this.inviteText.setText('Invite player');
			});
		});

		this.socket.on('updateSocketPlayerInfo', (data: { pos: string, gameID: number }) => {
            this.socket.emit('updateSocketPlayerInfo', data);
        });

	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	preload(): void {
		this.load.image('return', 'assets/returnButton_03.png');
		this.load.image('return-hover', 'assets/returnButton_green.png');
		this.load.image('return-lock', 'assets/returnButton_lock.png');
		this.load.image('container', 'assets/menu-container.png');
		this.load.image('container-hover', 'assets/container-green.png');
		this.load.image('container-lock', 'assets/container-lock.png');
		this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
		this.load.bitmapFont('arcade_blue', 'assets/fonts/arcade_blue.png', 'assets/fonts/arcade_blue.xml');
		this.load.image('invite', 'assets/invite.png');
		this.load.image('bg', 'assets/star-background-moon.png');
		this.load.image('star', 'assets/star-yellow.png');
		this.load.image('starblue', 'assets/star-blue.png');
		this.load.image('check-empty', 'assets/check-empty.png');
		this.load.image('check-ok', 'assets/check-ok.png');
		this.load.image('light-speed', 'assets/grey-ball-moving.png');
		this.load.image('extra-ball', 'assets/extra-ball.png');
		this.load.image('star-bumpers', 'assets/star-bumpers.png');
	}

	loadAvatarA() {
		this.load.on('filecomplete-image-avatar_A', function () {
			this.scene.add.image(this.scene.sys.canvas.width * 0.2, this.scene.sys.canvas.height * 0.3, 'avatar_A').setDisplaySize(90, 90).setOrigin(0.5);
		});
		this.load.image('avatar_A', this.playerA.picture);
		this.load.start();
	}

	loadAvatarB() {
		this.load.on('filecomplete-image-avatar_B', function () {
			this.scene.avatarB.setTexture('avatar_B');
			this.scene.avatarB.setDisplaySize(90, 90);
		});
		
		if (this.textures.exists('avatar_B'))
			this.textures.remove('avatar_B');

		this.load.image('avatar_B', this.playerB.picture);
		this.load.start();
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	create(): void {
		const { width, height } = this.scale;
		this.add.image(0,0, 'bg').setScale(0.8).setOrigin(0);

		//stars
		let stars = [];
		for (let i = 0; i < 3; i++)
			stars.push(this.physics.add.image(Phaser.Math.Between(0, width),Phaser.Math.Between(0, height), 'star').setScale(0.8).setOrigin(0));

		for (let i = 0; i < 3; i++)
			stars.push(this.physics.add.image(Phaser.Math.Between(0, width),Phaser.Math.Between(0, height), 'starblue').setScale(0.8).setOrigin(0));

		stars.forEach((element) =>{
			element.setVelocityX(Phaser.Math.Between(-15, 15)).setVelocityY(Phaser.Math.Between(-15, 15)).setCollideWorldBounds(true).setBounce(1, 1);
		});

		if (this.gameLobby.id === undefined) {
			// Création de la partie dans la DB et récupération de ses données
			this.thisPlayerID = this.playerA.id;
			this.socket.emit('CreateGame');
		} else {
			// Récupération données de la game existante
			this.thisPlayerID = this.playerB.id;
			this.socket.emit('FindGameByID', this.gameLobby.id);
		}


		this.displayGroupPlayerB = this.add.group();

		/* Return button */
		this.returnButton = this.add.image(width * 0.1, height * 0.9, 'return').setDisplaySize(80, 80);

			this.returnButton.setInteractive();
			this.returnButton.on("pointerover", () => {
				if (this.isReady === false)
					this.returnButton.setTexture('return-hover');
			});

			this.returnButton.on("pointerout", () => {
				if (this.isReady === false)
					this.returnButton.setTexture('return');
			});

			this.returnButton.on("pointerup", () => {
				if (this.isReady === false) {
					this.scene.launch('exit-confirm', {
						'scene': 'main-menu',
						'sceneFrom': 'create-custom',
						'gameID': this.gameLobby.id,
						'socket': this.socket,
						'playerID': this.thisPlayerID
					});
				}
			});

		this.socket.once('LeaveGame-playerA', (playerID: number) => {
			this.socketOff();
			this.add.rectangle(0, 0, width, height, 0x111111, 0.9).setOrigin(0, 0).setInteractive();
			const popup = this.add.image(width / 2, height / 2, 'container');
			this.add.bitmapText(popup.x, popup.y, 'arcade',`${this.playerA.username} has left`).setOrigin(0.5).setFontSize(20);

			this.time.delayedCall(3000, () => {
				this.scene.stop('create-custom');
				this.scene.start('main-menu', {
					'socket': this.socket,
					'playerID': playerID
				});
			});
		});

		this.socket.on('LeaveGame-playerB', () => {
			if (this.isReady === true) {
				this.returnButton.setTexture('return');
				this.readyButton.setTexture('container');
				this.isReady = false;
				this.waitingText.setVisible(false);
				this.socket.emit('GameStart_cancel', this.gameLobby.id);
			};

			if (this.bumperActive === true) {
				this.bumperActive = false;
				this.optionStarBumper.setTexture('check-empty');
			}
			if (this.extraBallActive === true) {
				this.extraBallActive = false;
				this.optionExtraBall.setTexture('check-empty');
			}
			if (this.speedActive === true) {
				this.speedActive = false;
				this.optionLightSpeed.setTexture('check-empty');
			}

			let group = this.add.group();
			this.displayGroupPlayerB.destroy(true);

			this.displayGroupPlayerB = this.add.group();
			this.invitePlayer();
			const blackscreen = this.add.rectangle(0, 0, width, height, 0x111111, 0.9).setOrigin(0, 0).setInteractive();
			const popup_bg = this.add.image(width / 2, height / 2, 'container');
			const popup_text = this.add.bitmapText(popup_bg.x, popup_bg.y, 'arcade',`${this.playerB.username} has left`).setOrigin(0.5).setFontSize(20);
			group.addMultiple([blackscreen, popup_bg, popup_text]);

			this.playerB.username = "";
			this.playerB.id = undefined;
			this.playerB.picture = "";

			this.time.delayedCall(2000, () => {	
				group.destroy(true);
			});
		}) // End of leaveGame-playerB


		// OPTIONS //
		const optionsBack = this.add.rectangle(width * 0.5, height * 0.5 - 100, 230, 150, DARK_BLUE).setOrigin(0, 0).setAlpha(0.9).setOrigin(0.5);
		this.add.bitmapText(width * 0.5, optionsBack.y - 50, 'arcade', 'Options', 15).setOrigin(0.5);
		
		/*star bumper*/
		const textBumper = this.add.bitmapText(width * 0.5, height * 0.5 - 100, 'arcade', 'Star Bumpers', 10).setOrigin(0.5);
		this.iconBumper = this.add.image(textBumper.x - textBumper.width / 2 - 30, textBumper.y, 'star-bumpers').setDisplaySize(32, 15);
		this.optionStarBumper = this.add.image(textBumper.x + textBumper.width - 40, textBumper.y, 'check-empty').setDisplaySize(15, 15);

		if (this.thisPlayerID === this.playerA.id) {
			this.optionStarBumper.setInteractive();

			this.optionStarBumper.on("pointerup", () => {
				if (this.bumperActive === false && this.playerB.id !== undefined){
					this.socket.emit('optionBumperOk', this.gameLobby.id);
					this.bumperActive = true;
				} else {
					this.socket.emit('optionBumperNotOk', this.gameLobby.id);
					this.bumperActive = false;
				}
			});
		}

		this.socket.on('optionBumperOkCallback', () => {
			this.bumperActive = true;
			this.optionStarBumper.setTexture('check-ok');
		});

		this.socket.on('optionBumperNotOkCallback', () => {
			this.bumperActive = false;
			this.optionStarBumper.setTexture('check-empty');
		});


		/*light speed*/
		const textSpeed = this.add.bitmapText(textBumper.x, textBumper.y + 25, 'arcade', 'Light Speed', 10).setOrigin(0.5);
		this.iconLightSpeed = this.add.image(textSpeed.x - textSpeed.width / 2 - 30, textSpeed.y, 'light-speed').setDisplaySize(32, 15);
		this.optionLightSpeed = this.add.image(this.optionStarBumper.x, textSpeed.y, 'check-empty').setDisplaySize(15, 15);

		if (this.thisPlayerID === this.playerA.id){
			this.optionLightSpeed.setInteractive();

			this.optionLightSpeed.on("pointerup", () => {
				if (this.speedActive === false  && this.playerB.id !== undefined){
					this.socket.emit('optionSpeedOk', this.gameLobby.id);
					this.speedActive = true;
				}
				else {
					this.socket.emit('optionSpeedNotOk', this.gameLobby.id);
					this.speedActive = false;
				}
			});
		}

		this.socket.on('optionSpeedOkCallback', () => {
			this.speedActive = true;
			this.optionLightSpeed.setTexture('check-ok');
		});

		this.socket.on('optionSpeedNotOkCallback', () => {
			this.speedActive = false;
			this.optionLightSpeed.setTexture('check-empty');
		});


		/*extra ball*/
		const textExtraBall = this.add.bitmapText(textSpeed.x, textSpeed.y + 25, 'arcade', 'Extra Ball', 10).setOrigin(0.5);
		this.iconExtraBall = this.add.image(textExtraBall.x - textExtraBall.width / 2 - 30, textExtraBall.y, 'extra-ball').setDisplaySize(32, 15);
		this.optionExtraBall = this.add.image(this.optionLightSpeed.x, textExtraBall.y, 'check-empty').setDisplaySize(15, 15);

		if (this.thisPlayerID === this.playerA.id){
			this.optionExtraBall.setInteractive();

			this.optionExtraBall.on("pointerup", () => {
				if (this.extraBallActive === false && this.playerB.id !== undefined){
					this.socket.emit('optionExtraBallOk', this.gameLobby.id);
					this.extraBallActive = true;
				}
				else {
					this.socket.emit('optionExtraBallNotOk', this.gameLobby.id);
					this.extraBallActive = false;
				}
			});
		}

		this.socket.on('optionExtraBallOkCallback', () => {
			this.extraBallActive = true;
			this.optionExtraBall.setTexture('check-ok');
		})

		this.socket.on('optionExtraBallNotOkCallback', () => {
			this.extraBallActive = false;
			this.optionExtraBall.setTexture('check-empty');
		})
		// END OF OPTIONS//


		this.readyToPlay();
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	getPlayerA(): void {
		// Récupération des données du playerA, puis lancement de l'affichage
		axios.get(env.back_domain_url + "/users/me", {
			responseType: 'json',
			withCredentials: true
		}).then((data) => {
			this.playerA.id = data.data['id'];
			this.playerA.username = data.data['name'];
			this.playerA.picture = data.data['image_url'];
			this.loadAvatarA();
			this.createGameUI();
		});
	}

	displayPlayerA(): void {

		axios.get(env.back_domain_url + "/users/id/" + this.gameLobby.iduser1, {
			withCredentials: true
		}).then((data) => {
			this.playerA.id = data.data['id'];
			this.playerA.username = data.data['name'];
			this.playerA.picture = data.data['image_url'];
			this.loadAvatarA();
			this.createGameUI();
		})
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	createGameUI() {
		const   { width, height } = this.scale;

		this.add.bitmapText(width / 2, height / 11, 'arcade', 'Game lobby', 25).setOrigin(0.5);

		/* Player A */
		const playerAvatar = this.add.rectangle(width * 0.2, height * 0.3, 90, 90).setVisible(false);
		this.add.bitmapText(playerAvatar.x, playerAvatar.y + 80, 'arcade', this.playerA.username, 15).setOrigin(0.5);

		/* Bouton pour inviter playerB si il n'existe pas */
		if (this.playerB.id === undefined) {
			this.invitePlayer();
		} else {
			this.displayPlayerB();
		}
	}

	async displayPlayerB() {
		const   { width, height } = this.scale;

		await this.getPlayerBData().then((data) => {
			this.gameLobby.iduser2 = data.data['id'];
			this.playerB.id = data.data['id'];
			this.playerB.username = data.data['name'];
			this.playerB.picture = data.data['image_url'];
			this.avatarB = this.add.image(width * 0.8, height * 0.3, 'invite').setDisplaySize(90, 90);
			const playerB = this.add.rectangle(width * 0.8, height * 0.3, 90, 90).setVisible(false);
			const playerBText = this.add.bitmapText(playerB.x, playerB.y + 80, 'arcade', this.playerB.username, 15).setOrigin(0.5);
			this.displayGroupPlayerB.addMultiple([playerB, playerBText, this.avatarB]);
			this.loadAvatarB();
		});
	};

	getPlayerBData() {
		return axios.get(env.back_domain_url + "/users/id/" + this.playerB.id, {
			withCredentials: true
		})
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	invitePlayer(): void {
		const   { width, height } = this.scale;

		const playerBvatar = this.add.image(width * 0.8, height * 0.3, 'invite').setDisplaySize(90, 90);
		this.inviteText = this.add.bitmapText(width * 0.8, playerBvatar.y + 80, 'arcade', 'Invite a player', 15).setOrigin(0.5);
		this.displayGroupPlayerB.addMultiple([playerBvatar, this.inviteText]);

		this.inviteText.setInteractive();
		this.inviteText.on("pointerover", () => {
			this.inviteText.setFont('arcade_blue');
		});

		this.inviteText.on("pointerout", () => {
			this.inviteText.setFont('arcade');
		});

		this.inviteText.on("pointerup", () => {
			this.scene.pause();
			this.scene.launch('invite-player', {
				"sceneFrom": "create-custom",
				"playerID": this.playerA.id,
				"gameID": this.gameLobby.id,
				"socket": this.socket
			});
		});
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	readyToPlay() {
		const   { width, height } = this.scale;

		this.readyButton = this.add.image(width * 0.5, height * 0.75, 'container').setDisplaySize(150, 80);
		this.add.bitmapText(this.readyButton.x, this.readyButton.y, 'arcade','Ready').setOrigin(0.5).setFontSize(20);

		this.waitingText = this.add.bitmapText(this.readyButton.x, this.readyButton.y + 70, 'arcade','Waiting for other player...').setOrigin(0.5).setFontSize(10);
		this.waitingText.setVisible(false);

		this.readyButton.setInteractive();
		this.readyButton.on("pointerup", () => {
			if (this.isReady === false && this.playerB.username) {
				this.returnButton.setTexture('return-lock');
				this.readyButton.setTexture('container-lock');
				this.waitingText.setVisible(true);
				this.isReady = true;

				let options = 0;
				if (this.bumperActive)
					options += 1;
				if (this.speedActive)
					options += 2;
				if (this.extraBallActive)
					options += 4;

				this.socket.emit('GameStart', {gameID:this.gameLobby.id, options: options});
			} else {
				if (this.isReady === true) {
					this.returnButton.setTexture('return');
					this.socket.emit('GameStart_cancel', this.gameLobby.id);
				}
				this.readyButton.setTexture('container');
				this.waitingText.setVisible(false);
				this.isReady = false;
			}
		});

		this.readyButton.on("pointerover", () => {
			if (this.isReady !== true)
				this.readyButton.setTexture('container-hover');
		});

		this.readyButton.on("pointerout", () => {
			if (this.isReady !== true)
				this.readyButton.setTexture('container');
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

