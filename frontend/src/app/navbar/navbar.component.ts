import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { threadId } from 'worker_threads';
import { IOnlineUser, IUser } from '../interfaces/user.interface';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { socketType } from '../modules/general/home/home.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnChanges {

	@Input() public iduser: number = 0;
	@Input() public user!: IUser;
	@Input() socket!: socketType;

	@Input() public friendList: IUser[] = [];
	@Input() public friendListid: number[] = [];
	@Input() public blackList: IUser[] = [];
	@Input() public blackListid: number[] = [];
	@Input() public onlineList!: IOnlineUser;
	@Input() public state: number = 1;

	@Output() onAddFriend = new EventEmitter();
	@Output() onRemoveFriend = new EventEmitter();
	@Output() onBlockUser = new EventEmitter();
	@Output() onUnBlockUser = new EventEmitter();
	@Output() onInviteUser = new EventEmitter();
	@Output() ongoToProfilePage = new EventEmitter();
	@Output() onDisplayChat = new EventEmitter();

	@Output() onNav = new EventEmitter();


	constructor(
		private location: Location,
		private router: Router,
		public dialog: MatDialog
		) { }

	ngOnChanges(changes: SimpleChanges): void {
		
	}

	ngOnInit(): void {
	}
	
	public switch(id: number) {
		if (this.state === 3) {
			if (this.userNeedConfirm()) {
				const dialogRef = this.dialog.open(confirmSwitchInterfaceDialog, {
					width: "500px",
					panelClass: "CenterDialog"
				})
				dialogRef.afterClosed().subscribe(result => {
					if (result && result === 1) {
						this.redirect(id);
					}
				})
			}
			else {
				this.redirect(id);
			}
		}
		else {
			this.redirect(id);
		}
		
	}

	public userNeedConfirm(): boolean {
		if (this.onlineList) {
			if (this.onlineList.ingame.find(user => user.id === this.iduser))
				return true;
			else if (this.onlineList.matchmaking.find(user => user.id === this.iduser))
				return true;
		}
		
		return false;
	}

	public redirect(id: number) {
		if (id == 1)
		{
			this.router.navigateByUrl('/home');
		}
		else if (id == 2)
		{
			this.router.navigateByUrl('/profil');
		}
		else if (id == 3)
		{
			this.router.navigateByUrl('/pong');
		}
		else if (id == 4)
		{
			this.router.navigateByUrl("/myprofil")
		}
		else if (id == 5)
		{
			this.router.navigateByUrl("/leaderboard")
		}
	}

	public displayChat() {
		this.onDisplayChat.emit(0);
	}

	
	public addFriend(id: any) { this.onAddFriend.emit(id); }
	public removeFriend(id: any) { this.onRemoveFriend.emit(id); }
	public blockUser(id: any) { this.onBlockUser.emit(id); }
	public unBlockUser(id: any) { this.onUnBlockUser.emit(id); }
	public inviteUser(id: any) { this.onInviteUser.emit(id); }
	public goToProfilePage(id: any) { this.ongoToProfilePage.emit(id); }

	

}


@Component({
	selector: 'confirmSwitchInterface.dialog',
	templateUrl: 'confirmSwitchInterface.dialog.html',
})
export class confirmSwitchInterfaceDialog implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<confirmSwitchInterfaceDialog>,
	) {}

	ngOnInit(): void {
	}

	onNoClick(): void {
	}

}