import eventsCenter from './eventCenter';

export class HudScene extends Phaser.Scene {
	keys: Phaser.Types.Input.Keyboard.CursorKeys;
	ScoreLeft: number;
	ScoreRight: number;

	Paused: boolean = false;

	leftName: string;
	rightName: string;

	PausePending: boolean = false;
	PausedWantResume: boolean = false;


	pauseLeftOne: Phaser.GameObjects.Arc;
	pauseLeftTwo: Phaser.GameObjects.Arc;

	pauseRightTwo: Phaser.GameObjects.Arc;
	pauseRightOne: Phaser.GameObjects.Arc;
	leftPlayerName: Phaser.GameObjects.BitmapText;
	rightPlayerName: Phaser.GameObjects.BitmapText;
	ScoreTextLeft: Phaser.GameObjects.BitmapText;
	ScoreTextRight: Phaser.GameObjects.BitmapText;

	pauseleftLeft: Phaser.GameObjects.BitmapText;
	pauseleftRight: Phaser.GameObjects.BitmapText;
	TextPause: Phaser.GameObjects.BitmapText;
	TextReady: Phaser.GameObjects.BitmapText;
	isSpectator: Boolean;


    constructor () {
        super({key : 'hud'});
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	init(data) {
		this.leftName = data.NameA;
		this.rightName = data.NameB;
		this.isSpectator = data.isSpectator;
	}

	preload () {
		this.load.image('return', 'assets/returnButton_03.png');
		this.load.image('container', 'assets/menu-container.png');
		this.load.bitmapFont('arcade_hud', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
		this.load.bitmapFont('arcade_blue_hud', 'assets/fonts/arcade_blue.png', 'assets/fonts/arcade_blue.xml');
	}

    create () {
		this.sys.game.canvas.width;
		this.ScoreLeft = 0;
		this.ScoreRight = 0;
		this.keys = this.input.keyboard.createCursorKeys();

		if (this.isSpectator === false){
			this.TextReady = this.add.bitmapText(this.sys.game.canvas.width / 2, this.sys.game.canvas.height /2 - 120, 'arcade_hud', ' GET\nREADY', 15).setOrigin(0.5);
			this.TextReady.setFontSize(30);
		} else {
			this.TextReady = this.add.bitmapText(this.sys.game.canvas.width / 2, this.sys.game.canvas.height * 0.25, 'arcade_hud', 'YOU ARE SPECTATING', 15).setOrigin(0.5);
			this.TextReady.setFontSize(30);
		}

		this.ScoreTextLeft = this.add.bitmapText(this.sys.game.canvas.width / 4, 25, 'arcade_blue_hud','' + this.ScoreLeft, 40).setOrigin(0.5);

		this.ScoreTextRight = this.add.bitmapText(this.sys.game.canvas.width * (3/4), 25, 'arcade_blue_hud','' + this.ScoreRight, 40).setOrigin(0.5);

		this.TextPause = this.add.bitmapText(this.sys.game.canvas.width / 2, this.sys.game.canvas.height - 50, 'arcade_blue_hud', '', 15).setOrigin(0.5);

		this.leftPlayerName = this.add.bitmapText(this.sys.game.canvas.width * 0.10, 15, 'arcade_blue_hud', this.leftName, 12).setOrigin(0.5);
		this.rightPlayerName = this.add.bitmapText(this.sys.game.canvas.width * 0.90, 15, 'arcade_blue_hud',this.rightName, 12).setOrigin(0.5);


		if (this.isSpectator === false) {
			this.pauseleftLeft = this.add.bitmapText(this.sys.game.canvas.width * 0.08, 36, 'arcade_blue_hud','pause:',  8).setOrigin(0.5)
			this.pauseLeftOne = this.add.circle(this.sys.game.canvas.width * 0.10 + 25, 36, 6, 0x0ACFBA);
			this.pauseLeftTwo = this.add.circle(this.sys.game.canvas.width * 0.10 + 40, 36, 6, 0x0ACFBA);

			this.pauseleftRight = this.add.bitmapText(this.sys.game.canvas.width * 0.88, 36, 'arcade_blue_hud', 'pause:' , 8).setOrigin(0.5)
			this.pauseRightOne = this.add.circle(this.sys.game.canvas.width * 0.90  + 25, 36, 6, 0x0ACFBA).setOrigin(0.5);
			this.pauseRightTwo = this.add.circle(this.sys.game.canvas.width * 0.90 + 40, 36, 6, 0x0ACFBA).setOrigin(0.5);
		}


		this.time.delayedCall(3000, this.ready, null, this);

		eventsCenter.on('goal', function(scoreA: number, scoreB : number) {
			this.ScoreTextLeft.setText('' + scoreA);
			this.ScoreTextRight.setText('' + scoreB);
		}, this);


		eventsCenter.on('gamepaused', function(data: { PlayerName: string, PauseA : number, PauseB : number }) {
			this.TextPause.setText('Game paused by ' + data.PlayerName);
			if (data.PauseA === 1) {
				if (this.pauseLeftOne){
					this.pauseLeftOne.destroy();
					this.pauseLeftOne = undefined;
				}
			} else if (data.PauseA === 0){
				if (this.pauseLeftOne){
					this.pauseLeftOne.destroy();
					this.pauseLeftOne = undefined;
				}
				if (this.pauseLeftTwo){
					this.pauseLeftTwo.destroy();
					this.pauseLeftTwo = undefined;
				}
			}

			if (data.PauseB === 1){
				if (this.pauseRightOne){
					this.pauseRightOne.destroy();
					this.pauseRightOne = undefined;
				}
			} else if (data.PauseB === 0){
				if (this.pauseRightOne){
					this.pauseRightOne.destroy();
					this.pauseRightOne = undefined;
				}
				if (this.pauseRightTwo){
					this.pauseRightTwo.destroy();
					this.pauseRightTwo = undefined;
				}
			}
			this.Paused = true;
		}, this);

		eventsCenter.on('resume', function(PlayerName: string) {
			this.TextPause.setText('');
			this.Paused = false;
		}, this);

		this.sys.events.once('shutdown', this.shutdown, this);
	}


/* ******************************************************** */
/* ******************************************************** */
/* ******************************************************** */
	shutdown() {
		eventsCenter.off('resume');
		eventsCenter.off('goal');
		eventsCenter.off('gamepaused');
	}

	update() {
		const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.keys.space!);
		if (this.isSpectator === false && spaceJustPressed){
			if (this.Paused === false)
				eventsCenter.emit('pauseRequest',);
			else
				eventsCenter.emit('resumeRequest',);
		}
	}

	ready() {
		this.TextReady.destroy();
	}

}
