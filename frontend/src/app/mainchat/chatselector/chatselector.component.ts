import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IOnlineUser, IUser } from 'src/app/interfaces/user.interface';
import { socketType } from 'src/app/modules/general/home/home.component';

@Component({
  selector: 'app-chatselector',
  templateUrl: './chatselector.component.html',
  styleUrls: ['./chatselector.component.scss']
})
export class ChatselectorComponent implements OnInit {
  		
	@Input() public iduser: number = 0;
	@Input() public user!: IUser;
	@Input() public socket!: socketType;
	
	@Input() public friendList: IUser[] = [];
	@Input() public friendListid: number[] = [];
	@Input() public blackList: IUser[] = [];
	@Input() public blackListid: number[] = [];
	@Input() public onlineList!: IOnlineUser;
	@Input() public oldMp: number = 0;
	@Input() public oldChat: number = 0;
	@Input() public focus: number = 0;

	
	public selected = new FormControl(0);

	@Output() onAddFriend = new EventEmitter();
	@Output() onRemoveFriend = new EventEmitter();
	@Output() onBlockUser = new EventEmitter();
	@Output() onUnBlockUser = new EventEmitter();
	@Output() onInviteUser = new EventEmitter();
	@Output() ongoToProfilePage = new EventEmitter();
	@Output() onCloseChat = new EventEmitter();
	@Output() onSelectMp = new EventEmitter();
	@Output() onSelectChat = new EventEmitter();
	@Output() onchangeFocus = new EventEmitter();

	constructor() { }

	ngOnInit(): void {
		this.selected.setValue(this.focus)
	}

	public close() {
		this.onCloseChat.emit();
	}

	public switch() {
		this.scrollToBottom();
		this.onchangeFocus.emit(this.selected.value)
	}

	public async scrollToBottom() {
		await this.sleep(200);
		let msg = document.getElementById("chat");
		if (msg) {
			msg!.scrollTop = msg!.scrollHeight;
		}
		let msgmp = document.getElementById("chatmp");
		if (msgmp) {
			msgmp!.scrollTop = msgmp!.scrollHeight;
		}
	}

	public sleep(ms: number) {
		return new Promise((resolve) => {
		  setTimeout(resolve, ms);
		});
	}

  
	public addFriend(id: any) { this.onAddFriend.emit(id); }
	public removeFriend(id: any) { this.onRemoveFriend.emit(id); }
	public blockUser(id: any) { this.onBlockUser.emit(id); }
	public unBlockUser(id: any) { this.onUnBlockUser.emit(id); }
	public inviteUser(id: number) { this.onInviteUser.emit(id); }
	public goToProfilePage(id: any) { this.ongoToProfilePage.emit(id); }
	public selectMp(id: any) { this.onSelectMp.emit(id); }
	public selectChat(id: any) { this.onSelectChat.emit(id); }

}
