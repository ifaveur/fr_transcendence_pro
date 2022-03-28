import { Socket } from "socket.io-client";
import { firstValueFrom } from "rxjs";
import { IUser, ILobbyUser } from "src/app/interfaces/user.interface";
import { env } from "src/app/global";
import axios from "axios";

const DARK_BLUE = 0x020E12;

export class joinCustomGame extends Phaser.Scene {

	/* Player variables */
    player: ILobbyUser = {id: 0, username: "", picture: ""};

	/* Game variables */
	socket: Socket;
    gameID: number;
	newGameID: number;
	playerA_id: number;

	/* Scrollable panel */
	rexUI: any;
	rooms = {
		games: <{name: string, gameID: number, playerA_id: number, picture : string}[]>[]
	}
	scrollablePanel: any;
	
	picures: any[];
	returnButton!: Phaser.GameObjects.Image;


	constructor() {
		super({key: 'join-custom'});
	};


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	init(data: any): void {
		this.player.id = data.playerID;
		this.socket = data.socket;

		this.socket.on('GameWaitingListCallback', (list) => {
			this.socket.off('GameWaitingListCallback');
			this.getGames(list);
		});

		this.socket.on('createdOneGameCallback', (list) => {
			this.rooms.games = [];
			this.getGames(list);
		});

		this.socket.on('deleteGameCallback', (list) => {
			this.rooms.games = [];
			this.getGames(list);
		});

		this.socket.on('JoinGameCallbackB', () => {
			for (let i = 0; i < this.rooms.games.length; i++) {
				if (this.rooms.games[i].gameID === this.newGameID)
					this.playerA_id = this.rooms.games[i].playerA_id;
			}
			this.rooms.games = [];
			this.socket.off('JoinGameCallbackB');
			this.socket.off('createdOneGameCallback');
			this.socket.off('deleteGameCallback');
			this.socket.off('updateSocketPlayerInfo');
			this.scene.stop('join-custom');
			this.scene.start('create-custom', {
				"playerA_ID": this.playerA_id,
				"playerB_ID": this.player.id,
				"gameID": this.newGameID,
				"socket": this.socket
			});
		});

		this.socket.on('updateSocketPlayerInfo', (data: { pos: string, gameID: number }) => {
            this.socket.emit('updateSocketPlayerInfo', data);
        });


		// Affichage d'une popup lorsqu'on reçoit une invitation
		this.socket.on('InvitePlayerCallback', (data: {PlayerA: IUser, gameID: number}) => {
			this.rooms.games.length = 0;
			this.scene.pause();
			this.scene.launch('accept-invit', {
				'sceneFrom': 'join-custom',
				'gameID': data.gameID,
				'socket': this.socket,
				'playerID': this.player.id,
				'idPlayerA': data.PlayerA.id
			});
		});
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	preload(): void {
		this.load.scenePlugin({
			key: 'rexuiplugin',
			url: 'assets/rexuiplugin.min.js',
			sceneKey: 'rexUI'
		});

		this.load.image('return', 'assets/returnButton_03.png');
		this.load.image('return-hover', 'assets/returnButton_green.png');
		this.load.image('container', 'assets/menu-container.png');
		this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
		this.load.bitmapFont('arcade_blue', 'assets/fonts/arcade_blue.png', 'assets/fonts/arcade_blue.xml');
		this.load.image('ballcontour', 'assets/ballcontour.png');
		this.load.image('bar', 'assets/bar.png');
		this.load.image('bg', 'assets/star-background-moon.png');
		this.load.image('star', 'assets/star-yellow.png');
		this.load.image('starblue', 'assets/star-blue.png');
	}

	loadAvatar(id: number) {
		if (id >= this.rooms.games.length)
			return;
		this.load.on('filecomplete', function () {
			this.scene.loadAvatar(id + 1);
		});
		this.load.image(this.rooms.games[id].name, this.rooms.games[id].picture);
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	create(): void {
		const { width, height } = this.scale;
		this.add.image(0,0, 'bg').setScale(0.8).setOrigin(0);

		//stars
		let stars =[];
		for (let i = 0; i < 3; i++)
			stars.push(this.physics.add.image(Phaser.Math.Between(0, width),Phaser.Math.Between(0, height), 'star').setScale(0.8).setOrigin(0));

		for (let i = 0; i < 3; i++)
			stars.push(this.physics.add.image(Phaser.Math.Between(0, width),Phaser.Math.Between(0, height), 'starblue').setScale(0.8).setOrigin(0));

		stars.forEach((element) =>{
			element.setVelocityX(Phaser.Math.Between(-15, 15)).setVelocityY(Phaser.Math.Between(-15, 15)).setCollideWorldBounds(true).setBounce(1, 1);
		});


		/* Return button */
		this.add.bitmapText(this.sys.canvas.width / 2, this.sys.canvas.height / 2 - 240, 'arcade', 'JOIN A GAME').setFontSize(30).setOrigin(0.5);
		this.returnButton = this.add.image(width * 0.1, height * 0.9, 'return').setDisplaySize(80, 80);

			this.returnButton.setInteractive();
			this.returnButton.on("pointerover", () => {
				this.returnButton.setTexture('return-hover');
			});

			this.returnButton.on("pointerout", () => {
				this.returnButton.setTexture('return');
			});

			this.returnButton.on("pointerup", () => {
				this.rooms.games.length = 0;

				this.socket.off('createdOneGameCallback');
				this.socket.off('deleteGameCallback');

				this.scene.stop('join-custom');
				this.scene.start('main-menu', {
					"playerID" : this.player.id,
					"socket": this.socket
				});
			});

		// Récupérer la liste des rooms
		this.socket.emit('GameWaitingList');
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	async getGames(list) {
		if (list.length === 0)
			this.printGames();
		else {
			for (let game of list) {
				if (this.rooms.games.find(room => room.gameID === game.id) || game.iduser2 !== null || game.iduser1 === this.player.id)
					continue ;
				else {
					await this.getGameData(game).then((data) => {
						data = data.data;
						if (game.iduser1 !== this.player.id)
							this.rooms.games.push({name: data['name'], gameID: game.id, playerA_id: game.iduser1, picture : data['image_url']});
					});
				}
			}
			this.loadAvatar(0);
			this.load.start();
		}
		if (this.rooms.games.length > 0) {
			this.load.on('complete', function () {
				this.scene.printGames();
			});
		} else {
			this.printGames();
		}
	}

	getGameData(game) {
		return axios.get(env.back_domain_url + "/users/id/" + game.iduser1, {
			withCredentials: true
		});
	}

	printGames() {
		const { width, height } = this.scale;

		if (this.scrollablePanel)
			this.scrollablePanel.destroy();

		this.scrollablePanel = this.createScrollablePanel(this, this.rooms)
			.setPosition(width / 2, height / 2.2)
			.layout();
			var panel = this.scrollablePanel.getElement('panel');
			this.rexUI.setChildrenInteractive(this.scrollablePanel, {
				targets: [
					panel.getByName('games', true)
				]
			})
			.on('child.click', (child: { name: number; }) => {
				this.socket.emit('JoinGame', child.name);
				this.newGameID = child.name;
			})
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	createScrollablePanel = (scene, data) => {
		var scrollablePanel = this.rexUI.add.scrollablePanel({
            x: 400,
            y: 300,
            width: 550,
            height: 300,

            scrollMode: 1,

            background: this.add.image(0, 0, 'container'),

            panel: {
                child: this.createPanel(this, data),

                mask: {
                    padding: 1
                },
            },

            slider: {
                track: this.add.image(0, 0, 'bar').setDisplaySize(20, 10).setDisplayOrigin(0.5).setDepth(1),
                thumb: this.add.image(0, 0, 'ballcontour').setDisplaySize(26, 26).setDisplayOrigin(0.5).setDepth(1),
            },

            space: {
                left: 40,
                right: 40,
                top: 40,
                bottom: 40,

                panel: 10,
            }
        })
		.layout()

		return scrollablePanel;
	}


	createPanel = (scene, data) => {
		var sizer = scene.rexUI.add.sizer({
			orientation: 'x',
			space: { item: 10 }
		})
			.add(
				this.createTable(scene, data, 'games', 1), // child
				{ expand: true }
			)
		return sizer;
	}


	createTable = (scene, data, key: string, rows: number) => {
		var capKey = key.charAt(0).toUpperCase() + key.slice(1);
		var title = scene.rexUI.add.label({
			orientation: 'y',
		});

		if (data.games.length === 0) {
			return scene.rexUI.add.sizer({
				orientation: 'y',
				space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 }
			})
		}

		var items = data[key];
		var columns = Math.ceil(items.length / rows);
		var table = scene.rexUI.add.gridSizer({
			column: columns,
			row: rows,

			rowProportions: 1,
			space: { column: 10, row: 10 },
			name: key  // Search this name to get table back
		});

		var item, r, c;
		var iconSize = 120;
		for (var i = 0, cnt = items.length; i < cnt; i++) {
			item = items[i];
			r = i % rows;
			c = (i - r) / rows;
			table.add(
				this.createIcon(scene, item, iconSize, iconSize),
				c,
				r,
				'top',
				0,
				false
			);
		}

		return scene.rexUI.add.sizer({
			orientation: 'y',
			space: { left: 10, right: 10, top: 10, bottom: 10, item: 10 }
		})
			.add(table, // child
				1, // proportion
				'center', // align
				0, // paddingConfig
				true // expand
			);
	}


	createIcon = (scene, item, iconWidth: number, iconHeight: number) => {
			var label = scene.rexUI.add.label({
				orientation: 'y',
				icon: scene.add.image(0, 0, item.name).setDisplaySize(iconWidth, iconHeight),
				text: scene.add.bitmapText(0, 0, 'arcade', item.name, 15).setCenterAlign().setLetterSpacing(2),
				name: item.gameID,

				space: {
					top: 20,
					left: 15,
					right: 15,
					icon: 3 }
			});

		return label;
	};

}
