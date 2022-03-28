import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUserHistory } from 'src/app/interfaces/stat.interface';
import { IUser } from 'src/app/interfaces/user.interface';
import { socketType } from 'src/app/modules/general/home/home.component';

@Component({
	selector: 'app-gamehistory',
	templateUrl: './gamehistory.component.html',
	styleUrls: ['./gamehistory.component.scss']
})
export class GamehistoryComponent implements OnInit, OnDestroy, OnChanges {

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


	public history: IUserHistory[][] = [];

	constructor() { }
	ngOnChanges(changes: SimpleChanges): void {
		this.socket.emit("getUserGameHistory", this.dispayid);
	}

	public getUserGameHistoryListener = (data: IUserHistory[]) => {
		this.history = [];
		data.forEach(raw => {
			if (this.history.length == 0) {
				this.history.push([raw]);
			}
			else {
				if (this.history[this.history.length - 1][0].id == raw.id) {
					this.history[this.history.length - 1].push(raw);
				}
				else {
					this.history.push([raw]);
				}
			}
		})
	}

	ngOnDestroy(): void {
		this.socket.off("getUserGameHistory", this.getUserGameHistoryListener);
		
	}

	ngOnInit(): void {
		this.socket.on("getUserGameHistory", this.getUserGameHistoryListener);

	}

	public getGameOption(val: number) {
		let ret = "";
		if ((val - 4) >= 0) {
			ret += "Extra Ball";
			val -= 4;
		}
		if ((val - 2) >= 0) {
			if (ret.length)
				ret += "  |  ";
			ret += "Light Speed";
			val -= 2;
		}
		if ((val - 1) >= 0) {
			if (ret.length)
				ret += "  |  ";
			ret += "Star Bumpers";
			val -= 1;
		}
		return ret;
	}

	public addFriend(id: any) { this.onAddFriend.emit(id); }
	public removeFriend(id: any) { this.onRemoveFriend.emit(id); }
	public blockUser(id: any) { this.onBlockUser.emit(id); }
	public unBlockUser(id: any) { this.onUnBlockUser.emit(id); }
	public inviteUser(id: number) { this.onInviteUser.emit(id); }
	public goToProfilePage(id: any) { this.ongoToProfilePage.emit(id); }

}
