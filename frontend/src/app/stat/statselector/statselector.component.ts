import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser } from 'src/app/interfaces/user.interface';
import { socketType } from 'src/app/modules/general/home/home.component';

@Component({
	selector: 'app-statselector',
	templateUrl: './statselector.component.html',
	styleUrls: ['./statselector.component.scss']
})
export class StatselectorComponent implements OnInit {
	
	@Input() public user!: IUser;
	@Input() public iduser: number = 0;
	@Input() public dispayid: number = 0;
	@Input() public socket!: socketType;
	@Input() public friendListid: number[] = [];
	@Input() public blackListid: number[] = [];
	
	@Output() onAddFriend = new EventEmitter();
	@Output() onRemoveFriend = new EventEmitter();
	@Output() onBlockUser = new EventEmitter();
	@Output() onUnBlockUser = new EventEmitter();
	@Output() onInviteUser = new EventEmitter();
	@Output() ongoToProfilePage = new EventEmitter();


	public selectedTab: number = 0;

	constructor() { }

	ngOnInit(): void {
		if (this.dispayid === 0)
			this.dispayid = this.iduser;
	}

	public changeSelectedTab(data: any) {
		this.selectedTab = data;
	}

	public addFriend(id: any) { this.onAddFriend.emit(id); }
	public removeFriend(id: any) { this.onRemoveFriend.emit(id); }
	public blockUser(id: any) { this.onBlockUser.emit(id); }
	public unBlockUser(id: any) { this.onUnBlockUser.emit(id); }
	public inviteUser(id: number) { this.onInviteUser.emit(id); }
	public goToProfilePage(id: any) { this.ongoToProfilePage.emit(id); }

}
