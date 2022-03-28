import * as Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import eventsCenter from './eventCenter';

interface Player {
	id: number,
	username: string,
	paddle: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	score: string;
}

export class MainScene extends Phaser.Scene {

	private keys: Phaser.Types.Input.Keyboard.CursorKeys;

	paddleA: Phaser.GameObjects.Rectangle;
	paddleB: Phaser.GameObjects.Rectangle;
	topBound: Phaser.GameObjects.Rectangle;
	botBound: Phaser.GameObjects.Rectangle;

	backgroundOne: Phaser.GameObjects.Arc;
	backgroundTwo: Phaser.GameObjects.Arc;
	backgroundTwoB: Phaser.GameObjects.Arc;
	backgroundThree: Phaser.GameObjects.Arc;
	backgroundThreeB: Phaser.GameObjects.Arc;
	backgroundBull: Phaser.GameObjects.Arc;
	backgroundBullB: Phaser.GameObjects.Arc;

	line: Phaser.GameObjects.Graphics;

	playerA: Player = {id: 0, username: "", paddle: undefined, score: ''};
	playerB: Player = {id: 0, username: "", paddle: undefined, score: ''};

	gameid: number;

	move: number;
	oldMove: number = 0;

	/* Connexion au serveur */
	socket: Socket;

		/* Params multijoueur */
		isPlayerA: boolean = false;
		isPlayerB: boolean = false;
		isSpectator: boolean = false;
		thisPlayerId: number;

		ball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
		ballTwo: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

		extraBall: boolean;
		bumpers: boolean;

	constructor () {
		super({key: 'main'});
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	init(data: any): void {
		this.socket = data.socket;

		this.playerA.id = data.playerA_ID;
		this.playerB.id = data.playerB_ID;
		this.playerA.username = data.playerA_name;
		this.playerB.username = data.playerB_name;
		this.gameid = data.gameID;
		this.thisPlayerId = data.playerID;
		this.extraBall = data.extraBall;
		this.bumpers = data.bumpers;

		if (this.thisPlayerId === this.playerA.id) {
			this.isPlayerA = true;
			this.isSpectator = false;
		} else if (this.thisPlayerId === this.playerB.id) {
			this.isPlayerB = true;
			this.isSpectator = false;
		} else
			this.isSpectator = true;


		this.socket.on('updateSocketPlayerInfo', (data: { pos: string, gameID: number }) => {
			this.socket.emit('updateSocketPlayerInfo', data);
		});

		/* Overlay */
		if (!this.scene.isActive('hud')) {
			this.scene.launch('hud', {
				"NameA" : this.playerA.username,
				"NameB" : this.playerB.username,
				"isSpectator" : this.isSpectator,
			});
		}

	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	preload() {
		if (eventsCenter)
			eventsCenter.destroy();
		this.load.image('ball', 'assets/GreyBall.png');
		this.load.image('ballTwo', 'assets/gold-ball.png');
		this.load.image('bg-light', 'assets/star-background-light.png');
		this.load.image('star-yellow', 'assets/star-yellow.png');
		this.load.image('star-blue', 'assets/star-blue.png');

		this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
		this.load.bitmapFont('arcade_blue', 'assets/fonts/arcade_blue.png', 'assets/fonts/arcade_blue.xml');
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	create() {
		const { width, height } = this.scale;
		this.add.image(0,0, 'bg-light').setScale(0.8).setOrigin(0);

		/* Shapes */
		this.paddleA = this.add.rectangle(50, height / 2, 30, 150, 0xFFFFFF, 0.5);
		this.paddleB = this.add.rectangle(width - 50, height / 2, 30, 150, 0xFFFFFF, 0.5);
		this.ball = this.physics.add.sprite(width / 2, height / 2 + (this.extraBall ? 40 : 0), 'ball');
		this.ball.setCircle(110, 20 , 20).setDepth(1).setDisplaySize(40, 40);

		if (this.extraBall) {
			this.ballTwo = this.physics.add.sprite(width / 2, height / 2 - 40, 'ballTwo')
			this.ballTwo.setCircle(110, 20 , 20).setDepth(1).setDisplaySize(40, 40);
		}

		this.createLine();

		this.physics.add.existing(this.paddleA, false);
		this.physics.add.existing(this.paddleB, false);
		this.physics.add.existing(this.ball, false);
		if (this.extraBall)
			this.physics.add.existing(this.ballTwo, false);


		this.topBound = this.add.rectangle(0, 0, width, 3, 0xFFFFFF, 0.5).setDisplayOrigin(0,0);
		this.botBound = this.add.rectangle(0, height - 3 , width, 3, 0xFFFFFF, 0.5).setDisplayOrigin(0,0);

		this.physics.add.existing(this.topBound, false);
		this.physics.add.existing(this.botBound, false);

		/* Key input */
		this.keys = this.input.keyboard.createCursorKeys();

		//Stars blockers//
		if (this.bumpers){
			let starOne = this.add.sprite(width / 2, height * 0.25, 'star-yellow').setDisplaySize(40, 40)
			let starTwo = this.add.sprite(width / 2, height * 0.75, 'star-yellow').setDisplaySize(40, 40)
		}

		this.socket.on('update', (data) => {
			var u = data.split(',');

			this.paddleA.y = parseInt(u[0], 36);
			this.paddleB.y = parseInt(u[1], 36);
			this.ball.x = parseInt(u[2], 36);
			this.ball.y = parseInt(u[3], 36);
			if (this.extraBall){
				this.ballTwo.x = parseInt(u[4], 36);
				this.ballTwo.y = parseInt(u[5], 36);
			}
		});

		this.socket.on('updatescore', (data) => {
			var u = data.split(',');
			eventsCenter.emit('goal', u[0], u[1]);
			this.playerA.score = u[0];
			this.playerB.score = u[1];
		});


		this.socket.on('endgame', (data) => {
			this.scene.stop('main');
			this.scene.stop('hud');
			this.socketOff();

			eventsCenter.off('pauseRequest');
			eventsCenter.off('resumeRequest');

			if (data) {
				var u = data.split(',');
				this.playerA.score = u[0];
				this.playerB.score = u[1];
			}
			this.scene.start('endgame', {
				'socket' : this.socket,
				'playerA_name' : this.playerA.username,
				'playerB_name' : this.playerB.username,
				'playerID' : this.thisPlayerId,
				'playerA_score': Number(this.playerA.score),
				'playerB_score': Number(this.playerB.score)
			});
		});


/* ******************************************************** */
/* *************************PAUSE************************** */
/* ******************************************************** */
		eventsCenter.on('pauseRequest', function() {
			this.socket.emit('pauseRequest', this.gameid);
		}, this);

		this.socket.on('pause', (data) => {
			eventsCenter.emit('gamepaused', data);
		});

		eventsCenter.on('resumeRequest', function() {
			this.socket.emit('resumeRequest', this.gameid);
		}, this);

		this.socket.on('resume', (data) => {
			eventsCenter.emit('resume', data);
		});

		if (this.isSpectator) {
			let backToMenu = this.add.rectangle(width / 2, height * 0.75 + 80, 100, 50, 0xffffff, 0.6);
			this.add.bitmapText(backToMenu.x, backToMenu.y, 'arcade_blue','LEAVE').setOrigin(0.5).setFontSize(15);

			backToMenu.setInteractive();
			backToMenu.on("pointerover", () => {
				backToMenu.fillAlpha = 1;
			});

			backToMenu.on("pointerout", () => {
				backToMenu.fillAlpha = 0.6;
			});

			backToMenu.on("pointerup", () => {
				this.socket.emit('leavingSpectator');
				this.scene.stop('main');
				this.scene.stop('hud');
				this.socketOff();

				eventsCenter.off('pauseRequest');
				eventsCenter.off('resumeRequest');
				this.scene.start("main-menu", {
					"playerID": this.thisPlayerId,
					"socket": this.socket
				});
			});
		}
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	update() {		
		if (this.isSpectator === false)
		{
			if(this.physics.collide(this.ball, this.paddleA)){
				this.paddleA.fillAlpha = 1;
				this.time.delayedCall(20, this.resetColor, null, this);
			}
			if(this.physics.collide(this.ball, this.paddleB)){
				this.paddleB.fillAlpha = 1;
				this.time.delayedCall(20, this.resetColor, null, this);
			}

			if(this.physics.collide(this.ball, this.topBound)){
				this.topBound.fillAlpha = 1;
				this.time.delayedCall(20, this.resetBoundColor, null, this);
			}

			if(this.physics.collide(this.ball, this.botBound)){
				this.botBound.fillAlpha = 1;
				this.time.delayedCall(20, this.resetBoundColor, null, this);
			}

			if (this.extraBall){
				if(this.physics.collide(this.ballTwo, this.paddleA)){
					this.paddleA.fillAlpha = 1;
					this.time.delayedCall(20, this.resetColor, null, this);
				}
				if(this.physics.collide(this.ballTwo, this.paddleB)){
					this.paddleB.fillAlpha = 1;
					this.time.delayedCall(20, this.resetColor, null, this);
				}

				if(this.physics.collide(this.ballTwo, this.topBound)){
					this.topBound.fillAlpha = 1;
					this.time.delayedCall(20, this.resetBoundColor, null, this);
				}

				if(this.physics.collide(this.ballTwo, this.botBound)){
					this.botBound.fillAlpha = 1;
					this.time.delayedCall(20, this.resetBoundColor, null, this);
				}
			}

			if (this.keys.down.isDown) {
				if (this.isPlayerA && this.physics.collide(this.botBound, this.paddleA))
					this.move = 0;
				else if (this.isPlayerB && this.physics.collide(this.botBound, this.paddleB))
					this.move = 0;
				else
					this.move = 1;
			} else if (this.keys.up.isDown){
				if (this.isPlayerA && this.physics.collide(this.topBound, this.paddleA))
					this.move = 0;
				else if (this.isPlayerB && this.physics.collide(this.topBound, this.paddleB))
					this.move = 0;
				else
					this.move = -1;
			} else {
				this.move = 0;
			}
			if (this.oldMove !== this.move) {
				this.socket.emit('move', {val: this.move, idgame: this.gameid});
				this.oldMove = this.move;
			}
		}
	}

	resetColor(){
		this.paddleA.fillAlpha = 0.5;
		this.paddleB.fillAlpha = 0.5;
	}

	resetBoundColor(){
		this.topBound.fillAlpha = 0.5;
		this.botBound.fillAlpha = 0.5;
	}


	createLine() {
		const { width, height } = this.scale;
		this.line = this.add.graphics();

		var curve = new Phaser.Curves.Line(new Phaser.Math.Vector2(width / 2, 0),
										new Phaser.Math.Vector2(width / 2, height));

		this.line.lineStyle(1, 0xffffff, 0);
		curve.draw(this.line);
		var points = curve.getPoints(32);
		this.line.fillStyle(0x000000, 0.3);

		for (var i = 0; i < points.length; i++) {
			this.line.fillCircle(points[i].x, points[i].y, 4);
		}
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

