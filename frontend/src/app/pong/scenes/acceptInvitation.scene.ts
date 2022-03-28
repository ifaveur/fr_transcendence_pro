import { HttpClient, HttpXhrBackend } from "@angular/common/http";
import { Socket } from "socket.io-client";
import { env } from 'src/app/global';

export class acceptInvitation extends Phaser.Scene {

	sceneFrom: string;
	gameID: number;
	playerID: number;
	idPlayerA: number;

	/* Client http */
    http = new HttpClient(new HttpXhrBackend({
        build: () => new XMLHttpRequest()
    }));
	socket: Socket;


    constructor ()
    {
        super({key : 'accept-invit'});
    }


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	init(data: any): void {
        this.sceneFrom = data.sceneFrom;
		this.gameID = data.gameID;
		this.socket = data.socket;
		this.playerID = data.playerID;
		this.idPlayerA = data.idPlayerA;

		this.socket.on('updateSocketPlayerInfo', (data: { pos: string, gameID: number }) => {
            this.socket.emit('updateSocketPlayerInfo', data);
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
	create() {
		const   { width, height } = this.scale;

		this.http.request('GET', env.back_domain_url + '/users/id/' + this.idPlayerA, {
			withCredentials: true
		}).subscribe((data) => {
			this.add.rectangle(width * 0.5, height * 0.5, width, height, 0x111111, 0.9);
			const inviteButton = this.add.image(width * 0.5, height * 0.5, 'cadre').setDisplaySize(width / 1.8, height / 1.8);
			this.add.bitmapText(inviteButton.x, inviteButton.y * 0.8, 'arcade', `${data['name']}`).setOrigin(0.5).setFontSize(20);
			this.add.bitmapText(inviteButton.x, inviteButton.y * 0.87, 'arcade', `sent an invitation`).setOrigin(0.5).setFontSize(20);

			const yesButton = this.add.image(inviteButton.x * 0.7, inviteButton.y * 1.3, 'container').setDisplaySize(150, 80);
			this.add.bitmapText(yesButton.x, yesButton.y, 'arcade', 'Join').setOrigin(0.5).setFontSize(15);

			const noButton = this.add.image(inviteButton.x * 1.3, inviteButton.y * 1.3, 'container').setDisplaySize(150, 80);
			this.add.bitmapText(noButton.x, noButton.y, 'arcade', 'Decline').setOrigin(0.5).setFontSize(15);

			yesButton.setInteractive();
			noButton.setInteractive();

			yesButton.on("pointerover", () => {
				yesButton.setTexture('container-hover');
			});

			yesButton.on("pointerout", () => {
				yesButton.setTexture('container');
			});

			yesButton.on('pointerup', () => {
				this.socket.emit('JoinGame', this.gameID);
				this.socketOff();
				this.scene.stop(this.sceneFrom);
				this.socket.on('JoinGameCallbackB', () => {
					this.scene.start('create-custom', {
						"playerA_ID": this.idPlayerA,
						"playerB_ID": this.playerID,
						"gameID": this.gameID,
						"socket": this.socket
					});
				});
			});

			noButton.on("pointerover", () => {
				noButton.setTexture('container-hover');
			});

			noButton.on("pointerout", () => {
				noButton.setTexture('container');
			});

			noButton.on('pointerup', () => {
				this.socket.emit('InvitationDeclined', this.idPlayerA);
				this.scene.stop('accept-invit');
				this.scene.resume(this.sceneFrom);
			});
		})
	}

	socketOff(): void {
		this.socket.off('createdOneGameCallback');
		this.socket.off('deleteGameCallback');
	}


}
