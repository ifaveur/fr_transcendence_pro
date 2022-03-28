import { toPublicName } from '@angular/compiler/src/i18n/serializers/xmb';
import { Component, OnInit, OnChanges, SimpleChanges, Input, OnDestroy, Output, EventEmitter } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { firstValueFrom, Observable } from 'rxjs';
import { IChat } from '../../interfaces/chat.interface';
import { io, Socket } from "socket.io-client";
import { AuthComponent } from 'src/app/auth/auth.component';
import { Router } from '@angular/router';
import { IChatMsg } from 'src/app/interfaces/msg.interface';
import { ChatComponent } from '../chat/chat.component';
import { IUser } from 'src/app/interfaces/user.interface';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { socketType } from 'src/app/modules/general/home/home.component';

@Component({
	selector: 'app-room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit, OnChanges, OnDestroy {
	constructor(
		private auth: AuthComponent,
		private chatcompo: ChatComponent,
		private router: Router,
	) {}

		
	@Input() public iduser: number = 0;
	@Input() public user!: IUser;
	@Input() public socket!: socketType;
	
	@Input() public friendList: IUser[] = [];
	@Input() public friendListid: number[] = [];
	@Input() public blackList: IUser[] = [];
	@Input() public blackListid: number[] = [];
	
	@Input() public oldChat: number = 0;

	@Output() onAddFriend = new EventEmitter();
	@Output() onRemoveFriend = new EventEmitter();
	@Output() onBlockUser = new EventEmitter();
	@Output() onUnBlockUser = new EventEmitter();
	@Output() onInviteUser = new EventEmitter();
	@Output() ongoToProfilePage = new EventEmitter();
	@Output() onSelectChat = new EventEmitter();

	public roomList: IChat[] = [];
	public roomMsgList: IChatMsg[] = [];
	public selectroom: IChat = this.roomList[0];
	public nullroom: IChat = this.roomList[0];
	public popup: number = 0;


	public onCreateRoomListener = (data: IChat[]) => {
		this.updateRoomList(data);
	}

	public onUpdateRoomInfoListener = (data: IUser[]) => {
		this.socket.emit("loadChatList", this.iduser)
	}
	
	public onChangeRoomListener = (data: {chatid: number, msgs: IChatMsg[]}) => {
		this.onChangeRoomCallBack(data.chatid, data.msgs);
	}

	public askUpdateRoomList = () => {
		this.socket.emit("updateRoomList")
	}

	public onUpdateRoomListListener = (data: IChat[]) => {
		this.updateRoomList(data);
	}

	async ngOnInit(): Promise<void> {
		this.socket.on('createRoomCallBack', this.onCreateRoomListener);
		this.socket.on('updateRoomInfo', this.onUpdateRoomInfoListener);
		
		this.socket.on("updateRoomList", this.onUpdateRoomListListener);
		this.socket.on("_updateRoomList", this.askUpdateRoomList);
		this.socket.on('changeRoom', this.onChangeRoomListener);

		this.socket.emit("updateRoomList")


	}

	ngOnDestroy(): void {
		this.socket.off('createRoomCallBack', this.onCreateRoomListener);
		this.socket.off('updateRoomInfo', this.onUpdateRoomInfoListener);
		this.socket.off("updateRoomList", this.onUpdateRoomListListener);
		this.socket.off("_updateRoomList", this.askUpdateRoomList);
		this.socket.off('changeRoom', this.onChangeRoomListener);
	}

	async ngOnChanges(changes: SimpleChanges): Promise<void> {
		if (!await this.auth.isLoggedIfNotRedir())
			return 
	}

	public onFocus(id: number) {
		let room = document.getElementById(id.toString());
		if (room)
			room!.style.background = "#050972";
	}

	public onUnFocus(id: number) {
		let room = document.getElementById(id.toString());
		if (room)
			room!.style.background = "#03042b";
	}

	public async onChangeRoom(id: number) {
		if (!await this.auth.isLoggedIfNotRedir())
			return ;

		if (!this.selectroom || this.selectroom && id != this.selectroom.id) {
			this.socket.emit('changeRoom', { idUser: this.iduser, idChat: id });
		}
	}

	public async onChangeRoomCallBack(chatID: number, msgsList: IChatMsg[]) {
		if (!await this.auth.isLoggedIfNotRedir())
			return 
		if (this.selectroom) {
			this.onUnFocus(this.selectroom.id);
		}
		this.selectroom = this.roomList.find(room => room.id === chatID)!
		this.roomMsgList = msgsList;
		this.onFocus(this.selectroom.id);
		this.onSelectChat.emit(chatID);
	}


	public CreateRoom() {
		this.popup = 2;
	}

	public JoinRoom() {
		this.popup = 1;
	}

	public async leaveRoom(id: number) {
		if (!await this.auth.isLoggedIfNotRedir())
			return
		this.socket.emit('leaveRoom', { idUser: this.iduser, idChat: id })
		if (this.selectroom != undefined && id === this.selectroom.id)
			this.selectroom = this.nullroom;
	}

	public async updateRoomList(listChats: IChat[]) {
		if (!await this.auth.isLoggedIfNotRedir())
			return 

		this.roomList = listChats
		if (this.selectroom) {
			this.selectroom = this.roomList.find(room => room.id === this.selectroom.id)!
			await this.sleep(100);
			if (this.selectroom)
				this.onFocus(this.selectroom.id);
		}

		if (this.oldChat && this.roomList.find(room => room.id === this.oldChat)) {
			this.socket.emit('changeRoom', { idUser: this.iduser, idChat: this.oldChat });
		}
	}

	public sleep(ms: number) {
		return new Promise((resolve) => {
		  setTimeout(resolve, ms);
		});
	  }

	public closeAction(x: string) {
		this.popup = 0;
	}

	public addFriend(id: any) { this.onAddFriend.emit(id); }
	public removeFriend(id: any) { this.onRemoveFriend.emit(id); }
	public blockUser(id: any) { this.onBlockUser.emit(id); }
	public unBlockUser(id: any) { this.onUnBlockUser.emit(id); }
	public inviteUser(id: number) { this.onInviteUser.emit(id); }
	public goToProfilePage(id: any) { this.ongoToProfilePage.emit(id); }
}

