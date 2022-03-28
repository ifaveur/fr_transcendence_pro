import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IMpList } from '../interfaces/chat.interface';
import { IMpChange, IMpMsg } from '../interfaces/msg.interface';
import { IOnlineUser, IUser } from '../interfaces/user.interface';
import { socketType } from '../modules/general/home/home.component';

@Component({
  selector: 'app-mp',
  templateUrl: './mp.component.html',
  styleUrls: ['./mp.component.scss']
})
export class MpComponent implements OnInit, OnChanges, OnDestroy {

	@Input() public iduser: number = 0;
	@Input() public user!: IUser;
	@Input() public socket!: socketType;
		
	@Input() public friendList: IUser[] = [];
	@Input() public friendListid: number[] = [];
	@Input() public blackList: IUser[] = [];
	@Input() public blackListid: number[] = [];
	@Input() public onlineList!: IOnlineUser;
	@Input() public oldMp: number = 0;

	@Output() onAddFriend = new EventEmitter();
	@Output() onRemoveFriend = new EventEmitter();
	@Output() onBlockUser = new EventEmitter();
	@Output() onUnBlockUser = new EventEmitter();
	@Output() onInviteUser = new EventEmitter();
	@Output() ongoToProfilePage = new EventEmitter();
	@Output() onSelectMp = new EventEmitter();

	public mpList: IMpList[] = [];
	public selectedMp: IMpList = this.mpList[0];
	public NullMp = this.selectedMp;

	public mpMsgList: IMpMsg[] = []

	public availableUserToMp: IUser[] = [];

	constructor() { }
	
	public updateMPLstListener = (data :IMpList[]) => {
		this.socket.emit("updateAvailableContacts");
		this.mpList = data;
		if (this.oldMp) {
			this.socket.emit('changeMpRoom', { idUser: this.iduser, mpID: this.oldMp });
		}
	}

	public changeMpRoomListener = (data: IMpChange) => {
		this.onChangeMpCallBack(data.MpID, data.MpMsg)
	}

	public updateAvailableContactsListener = (data: IUser[]) => {
		this.availableUserToMp = data;
	}
	

	ngOnInit(): void {
		this.socket.on("updateMpList", this.updateMPLstListener);
		this.socket.on("changeMpRoom", this.changeMpRoomListener);
		this.socket.on("updateAvailableContacts", this.updateAvailableContactsListener);
		
		this.socket.emit("updateMpList")


	}

	ngOnDestroy(): void {
		this.socket.off("updateMpList", this.updateMPLstListener);
		this.socket.off("changeMpRoom", this.changeMpRoomListener);
		this.socket.off("updateAvailableContacts", this.updateAvailableContactsListener);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (this.selectedMp && this.selectedMp.iduser) {
			const selectuserid: number = this.selectedMp.iduser;
			if (this.blackListid.indexOf(selectuserid) > -1) {
				this.selectedMp = this.NullMp;
			}
		}

		if (changes.onlineList) {
			if (changes.onlineList.currentValue && changes.onlineList.previousValue) {
				let val = 
					changes.onlineList.currentValue.ingame.length +
					changes.onlineList.currentValue.offline.length +
					changes.onlineList.currentValue.online.length;

				let val2 = 
					changes.onlineList.previousValue.ingame.length +
					changes.onlineList.previousValue.offline.length +
					changes.onlineList.previousValue.online.length;

				if (val != val2) {
					this.socket.emit("updateAvailableContacts")
				}

			}
		}
	}
	
	public CreateMp(iduser: any) {
		this.socket.emit("createMpRoom", {iduser1: this.iduser, iduser2: iduser});
	}

	public onChangeMp(id: number) {
		if (!this.selectedMp || this.selectedMp && id != this.selectedMp.idmp) {
			this.socket.emit('changeMpRoom', { idUser: this.iduser, mpID: id });
		}
	}

	public async onChangeMpCallBack(mpid: number, msgsList: any[]) {
 
		if (this.selectedMp) {
			this.onUnFocus(this.selectedMp.idmp);
		}
		if (this.mpList) {
			this.selectedMp = this.mpList.find(mp => mp.idmp === mpid)!
			this.mpMsgList = msgsList;
			if (this.selectedMp) {
				this.onFocus(this.selectedMp.idmp);
				this.onSelectMp.emit(mpid);
			}
		}
	}

	public onFocus(id: number) {
		if (id) {
			let room = document.getElementById(id.toString());
			if (room)
				room!.style.background = "#050972";
		}
	}

	public onUnFocus(id: number) {
		if (id) {
			let room = document.getElementById(id.toString());
			if (room)
				room!.style.background = "#03042b";
		}
	}

	public addFriend(id: any) { this.onAddFriend.emit(id); }
	public removeFriend(id: any) { this.onRemoveFriend.emit(id); }
	public blockUser(id: any) { this.onBlockUser.emit(id); }
	public unBlockUser(id: any) { this.onUnBlockUser.emit(id); }
	public inviteUser(id: number) { this.onInviteUser.emit(id); }
	public goToProfilePage(id: any) { this.ongoToProfilePage.emit(id); }

}
