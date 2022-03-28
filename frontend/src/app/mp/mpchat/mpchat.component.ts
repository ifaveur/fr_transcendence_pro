import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IMpList } from 'src/app/interfaces/chat.interface';
import { IMpMsg, ISocketMsg } from 'src/app/interfaces/msg.interface';
import { IUser } from 'src/app/interfaces/user.interface';
import { socketType } from 'src/app/modules/general/home/home.component';

@Component({
  selector: 'app-mpchat',
  templateUrl: './mpchat.component.html',
  styleUrls: ['./mpchat.component.scss']
})
export class MpchatComponent implements OnInit, OnDestroy, OnChanges {

	constructor() { }
	
	@Input() public iduser: number = 0;
	@Input() public user!: IUser;
	@Input() public selectedMp!: IMpList;
	@Input() public socket!: socketType;
		
	@Input() public friendList: IUser[] = [];
	@Input() public friendListid: number[] = [];
	@Input() public blackList: IUser[] = [];
	@Input() public blackListid: number[] = [];

	@Input() public mpMsgList: IMpMsg[] = [];
	
	@Output() onAddFriend = new EventEmitter();
	@Output() onRemoveFriend = new EventEmitter();
	@Output() onBlockUser = new EventEmitter();
	@Output() onUnBlockUser = new EventEmitter();
	@Output() onInviteUser = new EventEmitter();
	@Output() ongoToProfilePage = new EventEmitter();

	public msginput: string = "";

	public addMpMsgListener = (data: IMpMsg) => {
		this.addMessageCallBack(data);
	}
	
	ngOnInit(): void {
		this.socket.on("addMpMsg", this.addMpMsgListener);

	}
	
	ngOnChanges(changes: SimpleChanges): void {
		this.scrollToBottom();
	}

	ngOnDestroy(): void {
		this.socket.off("addMpMsg", this.addMpMsgListener);
	}

	public async onSubmit(fmp: NgForm) {

		if (!fmp.value.message || !fmp.value.message.length)
			return ;

		this.handleSubmitNewMessage(fmp.value.message)
		fmp.reset();
	}

	
	public async handleSubmitNewMessage(msg: string): Promise<void> {
		let val: IMpMsg = {
			message: msg,
			iduser: this.iduser,
			idmp: this.selectedMp.idmp
		}
		this.socket.emit('addMpMsg', val);
	}

	public async addMessageCallBack(message: IMpMsg) {
		this.mpMsgList.push(message);
		this.scrollToBottom();
	}

	public async scrollToBottom() {
		await this.sleep(200);
		let msg = document.getElementById("chatmp");
		if (msg) {
			msg!.scrollTop = msg!.scrollHeight;
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

}
