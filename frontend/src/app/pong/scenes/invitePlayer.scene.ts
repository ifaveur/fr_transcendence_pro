import axios from "axios";
import { io, Socket } from "socket.io-client";
import { env } from "src/app/global";

const DARK_BLUE = 0x020E12;

export class invitePlayerScene extends Phaser.Scene {

	/* Variables */
	text: Phaser.GameObjects.Text;
	keys: Phaser.Input.Keyboard.Key;
	nameInput: Phaser.GameObjects.DOMElement;

	sceneFrom: string;
	gameID: number;
	playerID: number;

	socket: Socket;

    constructor () {
        super({key : 'invite-player'});
    }


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	init(data: any): void {
		this.sceneFrom = data.sceneFrom;
		this.playerID = data.playerID;
		this.gameID = data.gameID;
		this.socket = data.socket;
	}

	preload() {
		this.load.html("invite", "assets/html_elements/input_invite_to_game.html");
		this.load.image('return', 'assets/returnButton_03.png');
		this.load.image('container', 'assets/menu-container.png');
		this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
		this.load.bitmapFont('arcade_blue', 'assets/fonts/arcade_blue.png', 'assets/fonts/arcade_blue.xml');
		this.load.image('cadre', 'assets/cadre-darkblue.png');
		this.load.image('close', 'assets/close.png');
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
    create () {
		const   { width, height } = this.scale;
		this.keys = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
		let     group: Phaser.GameObjects.Group;


		/* PopUp */
		this.add.rectangle(0, 0, width, height, 0x111111, 0.9).setOrigin(0, 0);
		const popUp = this.add.image(width * 0.5, height * 0.5, 'cadre').setDisplaySize(width / 1.5, height / 1.5);
	    const popUpText = this.add.bitmapText(popUp.x, popUp.y * 0.7, 'arcade', 'Find a player').setOrigin(0.5).setFontSize(30);

		/* Input pour la recherche du username */
		this.nameInput = this.add.dom(popUp.x, popUp.y).createFromCache("invite");


		this.keys.on("down", () => {
			let name = this.nameInput.getChildByName("name");

			// Recherche de l'utilisateur dans la db
			axios.get(env.back_domain_url + "/users/name/" + name['value'], {
				withCredentials: true
			}).then((data) => {
				data = data.data;
				if (data && data['id'] !== this.playerID) {
					if (group) {
						group.destroy(true);
					}
					group = this.validateInvite(data['name'], data['id']);
				} else if (data && data['id'] === this.playerID) {
					if (group) {
						group.destroy(true);
					}
					group = this.invalidInvite();
				} else {
					if (group) {
						group.destroy(true);
					}
					group = this.invalidName();
				}
			})
		});


		/* Exit popup */
        const exitButton = this.add.image(width * 0.5, height * 0.75, 'close').setDisplaySize(40, 40);

		exitButton.setInteractive();
        exitButton.on('pointerup', () => {
            this.scene.stop('invite-player');
			this.scene.resume(this.sceneFrom);
        })

	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	validateInvite(playerName: string, playerID: number): Phaser.GameObjects.Group {
		const   { width, height } = this.scale;
		let     group = this.add.group();

		const foundButton = this.add.rectangle(width * 0.5, this.nameInput.y + 60, this.nameInput.x + 30, 50, 0xffffff);
		const playerAText = this.add.bitmapText(foundButton.x * 0.7, foundButton.y, 'arcade_blue', playerName).setOrigin(0.5).setFontSize(15);

		//Button to join
		const joinButton = this.add.rectangle(foundButton.x * 1.37, foundButton.y, 120, 40, 0x111111);
		const joinText = this.add.bitmapText(joinButton.x, joinButton.y, 'arcade', 'Invite').setOrigin(0.5).setFontSize(15);

		const userOffline = this.add.bitmapText(foundButton.x * 0.59, playerAText.y + 40, 'arcade', 'Error - User offline or in a game').setFontSize(10);
		userOffline.setVisible(false);

		group.addMultiple([foundButton, playerAText, joinButton, joinText, userOffline]);

		joinButton.setInteractive();
		joinButton.on("pointerup", () => {
			userOffline.setVisible(false);
			this.socket.emit('InvitePlayer', { gameID: this.gameID, playerBID: playerID });
		});

		//Invitation sent, close popup
		this.socket.on('InvitePlayerSent', () => {
			joinText.setText('Sent !');
			this.time.delayedCall(1500, () => {
				this.scene.stop('invite-player');
				this.scene.resume('create-custom');
			});
		});

		this.socket.on('InvitePlayerFailed', () => {
			userOffline.setVisible(true);
		});

		return group;
	}

	invalidName(): Phaser.GameObjects.Group {
		const   { width, height } = this.scale;
		let     group = this.add.group();

		const notFoundButton = this.add.rectangle(width * 0.5, this.nameInput.y + 60, this.nameInput.x + 30, 50, 0xffffff);
		const notFoundText = this.add.bitmapText(notFoundButton.x, notFoundButton.y, 'arcade_blue', 'User not found').setOrigin(0.5).setFontSize(15);
		group.addMultiple([notFoundButton, notFoundText]);

		return group;
	}

	invalidInvite(): Phaser.GameObjects.Group {
		const   { width, height } = this.scale;
		let     group = this.add.group();

		const notFoundButton = this.add.rectangle(width * 0.5, this.nameInput.y + 60, this.nameInput.x + 30, 50, 0xffffff);
		const notFoundText = this.add.bitmapText(notFoundButton.x, notFoundButton.y, 'arcade_blue', `You can't invite yourself`).setOrigin(0.5).setFontSize(15);
		group.addMultiple([notFoundButton, notFoundText]);

		return group;
	}


}
