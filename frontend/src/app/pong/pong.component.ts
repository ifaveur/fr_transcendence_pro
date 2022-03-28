import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import * as Phaser from 'phaser';
import { endGame } from './scenes/endGame.scene';
import { launchMenu } from './scenes/launchMenu.scene';
import { MainScene } from './scenes/main.scene';
import { HudScene } from './scenes/hud.scene';
import { matchmaking } from './scenes/matchmaking.scene';
import { createCustomGame } from './scenes/createCustomGame.scene';
import { joinCustomGame } from './scenes/joinCustomGame.scene';
import { exitConfirmScene } from './scenes/exitConfirm.scene';
import { invitePlayerScene } from './scenes/invitePlayer.scene';
import { acceptInvitation } from './scenes/acceptInvitation.scene';
import { spectateGame } from './scenes/spectateGame.scene';
import { IUser } from '../interfaces/user.interface';
import { socketType } from '../modules/general/home/home.component';


@Component({
	selector: 'app-pong',
	templateUrl: './pong.component.html',
	styleUrls: ['./pong.component.scss']
})
export class PongComponent implements OnInit, OnChanges, OnDestroy {
	
	@Input() public socket!: socketType;
	@Input() public gameid: number =  0;
	@Input() public inviteUser: number =  0;
	@Input() public user!: IUser

	phaserGame: Phaser.Game;
	config: Phaser.Types.Core.GameConfig;

	public sceneMode: {id: number, scene: any[]}[] = [
		{id: 0, scene: [ launchMenu, createCustomGame, joinCustomGame, matchmaking, spectateGame, exitConfirmScene, invitePlayerScene, acceptInvitation, MainScene, HudScene, endGame ]},
		{id: 1, scene: [ createCustomGame, launchMenu, joinCustomGame, matchmaking, spectateGame, exitConfirmScene, invitePlayerScene, acceptInvitation, MainScene, HudScene, endGame ]},
		{id: 2, scene: [ MainScene, createCustomGame, launchMenu, joinCustomGame, matchmaking, spectateGame, exitConfirmScene, invitePlayerScene, acceptInvitation, HudScene, endGame ]},
	];
	constructor() {
		this.config = {
			type: Phaser.CANVAS,
			parent: 'game-container',
			physics: {
				default: 'arcade',
				arcade: {
					debug: false,
					gravity: { x: 0, y: 0 },
				}
			},
			loader: {
				crossOrigin: 'anonymous',
			},
			dom: {
				createContainer: true
			},
			width: 800,
			height: 600,
			scale: {
				mode: Phaser.Scale.FIT,
				autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
				max: {
				  width: 800,
				  height: 600
				}
			},
		};
	 }

	public tmpdata: any;
	ngOnChanges(changes: SimpleChanges): void {

	}

	public onJoinGameCallBack = () => {
		this.setConfigScene(1);
		this.phaserGame = new Phaser.Game(this.config);
		this.phaserGame.scene.start('create-custom', {
			"playerA_ID": this.tmpdata[0].iduser,
			"playerB_ID": this.user.id,
			"gameID": this.gameid,
			"socket": this.socket
		})
		this.socket.off('JoinGameCallbackB', this.onJoinGameCallBack);
	}

	public updateSocketPlayerInfo = (data:{ pos: string, gameID: number } ) => {
		this.socket.emit('updateSocketPlayerInfo', data);
		this.socket.off('updateSocketPlayerInfo', this.updateSocketPlayerInfo);
	}

	public onSpectateCallBack = (data) => {
		this.setConfigScene(2);
		this.phaserGame = new Phaser.Game(this.config);

		let optionBumper: boolean;
		let optionExtraBall: boolean;
		if (data.options === 4 || data.options === 5 || data.options === 6 || data.options === 7)
			optionExtraBall = true;
		if (data.options === 1 || data.options === 3 || data.options === 5 || data.options === 7)
			optionBumper = true;

		this.phaserGame.scene.start('main', {
			"playerA_ID": data.playerA_id,
			"playerB_ID": data.playerB_id,
			"playerA_name": data.playerA_name,
			"playerB_name": data.playerB_name,
			"gameID": this.tmpdata[1].idgame,
			"playerID": this.user.id,
			"extraBall": optionExtraBall,
			"bumpers": optionBumper,
			"socket": this.socket
		})
		
		this.socket.off('StartToSpectate', this.onSpectateCallBack);
	}

	public onJoinGame = (data: any) => {
		this.tmpdata = data;
		if (data.length === 1) {
			this.socket.on('updateSocketPlayerInfo', this.updateSocketPlayerInfo);
			this.socket.on('JoinGameCallbackB', this.onJoinGameCallBack)
			this.socket.emit('JoinGame', this.gameid);
		}
		else if (data.length > 1 && data[0].status != "finish") {
			this.socket.on('updateSocketPlayerInfo', this.updateSocketPlayerInfo);
			this.socket.on("StartToSpectate", this.onSpectateCallBack);
			this.socket.emit('newSpectator', {GameID: this.gameid, playerA: this.tmpdata[0].iduser, playerB: this.tmpdata[1].iduser});
		}
		else {
			this.setConfigScene(0);
			this.phaserGame = new Phaser.Game(this.config);
			this.phaserGame.scene.start('main-menu', {
				"playerID": this.user.id,
				"socket": this.socket
			});
		}
	}


	ngOnInit(): void {
		this.socket.on("getGameData", this.onJoinGame);
		if (this.gameid) {
			this.socket.emit("getGameData", this.gameid)
		}
		else if (this.inviteUser) {
			this.setConfigScene(1);
			this.phaserGame = new Phaser.Game(this.config);
			
			this.phaserGame.scene.start("create-custom", {
				"playerA_ID": this.user.id,
				"socket": this.socket,
				"invitePlayerId": this.inviteUser,
			});
		}
		else{
			this.setConfigScene(0);
			this.phaserGame = new Phaser.Game(this.config);
			this.phaserGame.scene.start('main-menu', {
				"playerID": this.user.id,
				"socket": this.socket
			});
		}
		this.initFocus();
	}

	ngOnDestroy() {
		this.socket.off("getGameData", this.onJoinGame);
		this.removefocus();
		if (this.phaserGame)
			this.phaserGame.destroy(true, false);
	}

	public setConfigScene(mode: number) {
		this.config.scene = this.sceneMode.find(scene => scene.id === mode).scene
	}

	onClickEventListener = (e) => {
		var element = e.target  as HTMLElement;
		if (element.tagName === "CANVAS" || element.tagName === "INPUT" && !element.className) 
			this.enableKey();
		else
			this.disableKey();
	}

	public initFocus() {
		document.body.addEventListener('click', this.onClickEventListener);
	}

	public removefocus() {
		document.body.removeEventListener('click', this.onClickEventListener)
		 
	}

	public enableKey() {
		if (this.phaserGame) {
			this.phaserGame.input.keyboard.enabled = true;
			this.phaserGame.input.mouse.enabled = true;
		}
	}

	public disableKey() {
		if (this.phaserGame) {
			this.phaserGame.input.keyboard.enabled = false;
			this.phaserGame.input.mouse.enabled = false;
		}
	}
}
