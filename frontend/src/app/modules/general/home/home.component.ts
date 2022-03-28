import { Component, Inject, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { stat } from 'fs';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AuthComponent } from 'src/app/auth/auth.component';
import { IBlackList, IFriendList, IOnlineUser, IUser } from 'src/app/interfaces/user.interface';
import { env } from 'src/app/global';
import { Location } from '@angular/common';
import { throws } from 'assert';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { timeHours } from 'd3-time';

export type socketType = Socket<DefaultEventsMap, DefaultEventsMap>;

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy{

	public iduser: number = 0;
	public state: number = 1;
	public displaychat: number = 0;

	public ready: number = 0;

	public socket!: socketType;

	public friendList: IUser[] = [];
	public nonFriendList: IUser[] = [];
	public friendListid: number[] = [];
	public blackList: IUser[] = [];
	public nonBlackList: IUser[] = [];
	public blackListid: number[] = [];
	
	public user: IUser = {};

	public onlineList!: IOnlineUser;

	public oldChat: number = 0;
	public oldMp: number = 0;
	public focus: number = 0;
	
	constructor(
		readonly snackBar: MatSnackBar,
		private auth: AuthComponent,
		private router: Router,
		private location: Location,
		public dialog: MatDialog,
	) { }


	ngOnDestroy(): void {
		this.socket.removeAllListeners();
		this.socket.disconnect();
	}

	public connectListener = () => {
		this.ready = 1;
		
		this.socket.emit("getFriendList");
		this.socket.emit("getBlockedList");
		this.socket.emit("changeInterface", this.state);
	}

	public disconnectListener = () => {
	}

	public getFriendListListener = (data: IFriendList) => {
		this.friendList = data.friend;
		this.nonFriendList = data.nonfriend;
		this.friendListid = [];
		this.friendList.forEach(friend => {
			if (friend!.id) {
				const id: number = friend!.id
				this.friendListid.push(id);
			}
		})
	}

	public getBlackListListener = (data: IBlackList) => {
		this.blackList = data.blocked;
		this.nonBlackList = data.nonblocked;
		this.blackListid = [];
		this.blackList.forEach(black => {
			if (black!.id) {
				const id: number = black!.id
				this.blackListid.push(id);
			}
		})
	}

	public onNotify = (data: {type: string, msg: string, mpID: number}) => {
		this.displaySnack(data);
	}

	public onUpdateStatusListListener = async (data: IOnlineUser) => {
		this.onlineList = data;
	}

	public onRefreshUser = (data: IUser) => {
		this.user = data;
	}

	public selectMp(id: any)	{ this.oldMp = id;		}
	public selectChat(id: any)	{ this.oldChat = id;	}
	public changeFocus(id: any) { this.focus = id;		}

	public ErrorSocket = () => {
		if (this.socket) {
			this.socket.removeAllListeners();
			this.socket.disconnect();
		}
		this.state = 0;
		const dialogRef = this.dialog.open(tooMuchWindowOpenDialog, {
			width: "500px",
			panelClass: "ErrorDialog"
		})
		dialogRef.afterClosed().subscribe(result => {
			this.ErrorSocket();
		})
	}

	public onInvitePlayerListener = (data : {PlayerA: IUser, gameID: number, socketPlayerA: string}) => {
		const dialogRef = this.dialog.open(GameInviteDialog, {
			width: "500px",
			panelClass: "CenterDialog",
			data: {
				PlayerA: data.PlayerA,
				gameID: data.gameID
			}
		})
		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				if (result === 1) {
					this.socket.emit("InvitationAccepted", data.socketPlayerA);

					this.router.navigate(["/pong/" + data.gameID])
				}
				else if (result === 2) {
					this.socket.emit("InvitationDeclined", data.socketPlayerA);
				}
			}
		})
	}

	public onErrorRedirect = () => {
		this.router.navigateByUrl('home');
	}


	async ngOnInit(): Promise<void> {
		this.iduser = await this.auth.getmyID();
		this.user = await this.auth.getMe();
		this.state = this.parsing_location(this.location.path())
		if (!this.socket) {
			this.socket = io(env.back_domain_url,
			{
				auth: {
					idUser: this.iduser
				}
			})

		}
		this.socket.on("multiSocketError", this.ErrorSocket);

		if (this.state != 3) {
			this.socket.on("InvitePlayerCallback", this.onInvitePlayerListener)
		}
		this.socket.on('connectCallBack', this.connectListener);
		this.socket.on('disconnect', this.disconnectListener);
		this.socket.on('getFriendList', this.getFriendListListener);
		this.socket.on('getBlockedList', this.getBlackListListener);
		this.socket.on('updateStatusList', this.onUpdateStatusListListener);
		this.socket.on('updatedProfil', this.onRefreshUser)

		this.socket.on('notification', this.onNotify);
		this.socket.on('ERROR_REDIRECT', this.onErrorRedirect);


	}

	private parsing_location(path : string) : number
	{
		if (path == "/home")
			return 1;

		if (path.startsWith("/profil/"))
			return 2;
		
		if (path.startsWith("/pong"))
			return 3;

		if (path == "/myprofil")
			return 4;
			
		if (path == "/leaderboard")
			return 5;
	}

	public onNav(id: number) {
		this.state = id;
	}

	public onDisplayChat(id: number) {
		if (this.displaychat === 1) {
			this.displaychat = 0;
			this.socket.emit("closePopUp", id);
		}
		else {
			this.displaychat = 1;
			this.socket.emit("openPopUp", id);
		}
	}

	public onCloseChat(id: any) {
		this.displaychat = 0;
		this.socket.emit("closePopUp", id);
	}

	public displaySnack(data: {type: string, msg: string, mpID: number}) {
		let snackBarRef
		if (data.mpID) {
			snackBarRef =  this.snackBar.open(data.msg, 'Open mp',{
				horizontalPosition: 'right',
				verticalPosition: 'top',
				duration: 5000,
				panelClass: [data.type]
			});
		}
		else {
			snackBarRef =  this.snackBar.open(data.msg, 'close',{
				horizontalPosition: 'right',
				verticalPosition: 'top',
				duration: 5000,
				panelClass: [data.type]
			});
		}

		
		snackBarRef.afterDismissed().subscribe(info => {
			if (info.dismissedByAction === true) {
				if (data.msg.startsWith("you have a new message from")) {
					this.focus = 1;
					this.oldMp = data.mpID
					if (this.displaychat === 0)
						this.onDisplayChat(1);
				}
			}
		})
	}

	public addFriend(id: any) {
		this.socket.emit("addFriend", id);
	}

	public removeFriend(id: any) {
		this.socket.emit("removeFriend", id);
	}

	public blockUser(id: any) {
		this.socket.emit("blockUser", id);
	}

	public unBlockUser(id: any) {
		this.socket.emit("UnBlockUser", id);
	}

	public inviteUser(id: any) {
		this.onCloseChat(0);
		if (this.location.path().startsWith("/pong/invite/" + id)) {
			this.socket.on("getGameUserIn", (idgame: number) => {
				this.socket.emit('InvitePlayer', { gameID: idgame, playerBID: id});
				this.socket.off('getGameUserIn');
			})
			this.socket.emit("getGameUserIn", this.iduser);
		}
		else
			this.router.navigateByUrl('pong/invite/' + id)
	}

	public goToProfilePage(id: any) {
		this.onCloseChat(0);
		this.router.navigateByUrl('profil/' + id)
	}

	public sleep(ms: number) {
		return new Promise((resolve) => {
		  setTimeout(resolve, ms);
		});
	  }

}

export interface IGameInviteData {
	PlayerA: IUser;
	gameID: number
}

@Component({
	selector: 'gameinvit.dialog',
	templateUrl: 'gameinvit.dialog.html',
})
export class GameInviteDialog implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<GameInviteDialog>,
		@Inject(MAT_DIALOG_DATA) public data: IGameInviteData,
	) {}

	ngOnInit(): void {
	}

	onNoClick(): void {
		this.dialogRef.close();
	}

}


@Component({
	selector: 'tooMuchWindowOpen.dialog',
	templateUrl: 'tooMuchWindowOpen.dialog.html',
})
export class tooMuchWindowOpenDialog implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<GameInviteDialog>,
	) {}

	ngOnInit(): void {
	}

	onNoClick(): void {
	}

}