import { Component, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { io, Socket } from "socket.io-client";
import { BrowserModule } from '@angular/platform-browser';
import { firstValueFrom, Observable, throwError } from 'rxjs';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { AuthComponent } from 'src/app/auth/auth.component';
import { Router } from '@angular/router';
import { IUser, IUserInChat, IUserInChatDetails, chatUserStatus } from 'src/app/interfaces/user.interface';
import { IChatMsg, ISocketMsg } from 'src/app/interfaces/msg.interface';
import { RoomComponent } from '../room/room.component';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IChat, ICreateChatMore } from 'src/app/interfaces/chat.interface';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { socketType } from 'src/app/modules/general/home/home.component';

export interface DialogData {
	type: 'mute' | 'unmute' | 'ban' | 'unban' | 'admin' | 'unadmin' | 'kick' | 'deletechat';
	name: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
	
	@Input() public iduser: number = 0;
	@Input() public user!:IUser;
	@Input() public idchat: number = 0;
	@Input() public room!: IChat;
	
	@Input() public namechat: string = "";
 	@Input() public socket!: socketType;
	 		
	@Input() public friendList: IUser[] = [];
	@Input() public friendListid: number[] = [];
	@Input() public blackList: IUser[] = [];
	@Input() public blackListid: number[] = [];

	@Input() public messages: IChatMsg[] = [];

  	@Output() onAddFriend = new EventEmitter();
  	@Output() onRemoveFriend = new EventEmitter();
  	@Output() onBlockUser = new EventEmitter();
  	@Output() onUnBlockUser = new EventEmitter();
  	@Output() onInviteUser = new EventEmitter();
	@Output() ongoToProfilePage = new EventEmitter();

	public displaySetting: number = 0;
	public editSetting: number = 0;

	public form!: FormGroup
	
	public userIsMute = false
	public userIsBan = false
	public isAdmin = false
	public isSuperAdmin = false

	public userList: IUserInChatDetails[] = []; 
	public availableUserList: IUser[] = [];
	public userToAdd: number[] = [];
	public msginput: string = "";

	constructor(
		private auth: AuthComponent,
		public dialog: MatDialog,
	) {}

	public updateUserListCallBackListener = (data: IUserInChatDetails[]) => {
		this.userList = data;
	}

	public updateAvailabUsersListListener = (data: IUser[]) => {
		this.availableUserList = data;
	}


	public changeUserState(signal: string, state: boolean, chatID: number, targetUserID: number, time = 0) {
		const userWarnDto = { idUser: targetUserID, idChat: chatID, time: time }
		this.socket.emit('changeUserState', { userWarnDto: userWarnDto, signal: signal, state: state })
	}

	public updateUserStatelistener = (data: any) => {
		this.userIsMute = data.mute
		this.userIsBan = data.ban
		this.isAdmin = data.admin
		if (!this.isAdmin) {
			this.displaySetting = 0;
		}
		this.isSuperAdmin = data.superAdmin
		this.scrollToBottom();
	}

	public addMessageListener = (data: any) => {
		this.addMessageCallBack(data)
	}

	ngOnDestroy(): void {
		this.socket.off('updateChatUsersList', this.updateUserListCallBackListener);
		this.socket.off('updateAvailabUsersList', this.updateAvailabUsersListListener);
		this.socket.off('updateUserState', this.updateUserStatelistener);
		this.socket.off('addMessage', this.addMessageListener);
	}

	async ngOnChanges(changes: SimpleChanges): Promise<void> {
		this.editSetting = 0;
		if (!await this.auth.isLoggedIfNotRedir())
			return ;
		
		this.socket.emit('updateChatUsersList', this.idchat)
		this.socket.emit('updateAvailabUsersList', this.idchat)
		this.socket.emit('updateUserState', this.idchat)
		this.scrollToBottom();

    
	}

	ngOnInit(): void {
		this.socket.on('updateChatUsersList', this.updateUserListCallBackListener);
		this.socket.on('updateAvailabUsersList', this.updateAvailabUsersListListener);
		this.socket.on('updateUserState', this.updateUserStatelistener);
		this.socket.on('addMessage', this.addMessageListener);
    }

	public async onSubmit(f: NgForm) {
		if (!await this.auth.isLoggedIfNotRedir())
			return ;

		if (!f.value.message || !f.value.message.length)
			return ;

		this.handleSubmitNewMessage(f.value.message)
		f.reset();
	}

	public async handleSubmitNewMessage(msg: string): Promise<void> {
		let val: ISocketMsg = {
			message: msg,
			idUser: this.iduser,
			idChat: this.idchat
		}
		this.socket.emit('addMessage', val);
	}

	public async addMessageCallBack(message: any) {
		let val: IChatMsg = {
			message: message.message,
			userid: message.userid,
			idChat: message.chatid,
			createdat: message.createdat,
			user: message.user,
		}
		this.messages.push(val);
		this.scrollToBottom();
	}

	
	public roomSetting() {
		this.displaySetting = 1;
	}
	
	public async scrollToBottom() {
		await this.sleep(200);
		let msg = document.getElementById("chat");
		if (msg)
			msg!.scrollTop = msg!.scrollHeight;
	}

	public sleep(ms: number) {
		return new Promise((resolve) => {
		  setTimeout(resolve, ms);
		});
	}
	  
	public closeSetting() {
		this.displaySetting = 0;
	}

	public muteeuser(user: IUserInChatDetails) {
		if (user.status == "none") {
			const dialogRef = this.dialog.open(SetWarnTimerDialog, {
				width: "500px",
				panelClass: "CenterDialog",
				data: { type: "mute", name: user.name }
			});
			dialogRef.afterClosed().subscribe(result => {
				if (result){
					this.changeUserState('switchMute', true, this.idchat, user.id, result)
				}
			})
		}
		else if (user.status == "mute") {
			const dialogRef = this.dialog.open(SetWarnTimerDialog, {
				width: "500px",
				panelClass: "CenterDialog",
				data:  { type: "unmute", name: user.name }
			});
			dialogRef.afterClosed().subscribe(result => {
				if (result){
					this.changeUserState('switchMute', false, this.idchat, user.id)
				}
			})
		}
	}

	public banuser(user: IUserInChatDetails) {
		if (user.status == "none" || user.status == "mute") {
			const dialogRef = this.dialog.open(SetWarnTimerDialog, {
				width: "500px",
				panelClass: "CenterDialog",
				data: { type: "ban", name: user.name }
			});
			dialogRef.afterClosed().subscribe(result => {
				if (result){
					this.changeUserState('switchBan', true, this.idchat, user.id, result)
				}
			})
		}
		else if (user.status == "ban") {
			const dialogRef = this.dialog.open(SetWarnTimerDialog, {
				width: "500px",
				panelClass: "CenterDialog",
				data: { type: "unban", name: user.name }
			});
			dialogRef.afterClosed().subscribe(result => {
				if (result){
					this.changeUserState('switchBan', false, this.idchat, user.id)
				}
			})
		}
	}

	public deleteuser(user: IUserInChatDetails) {
		const dialogRef = this.dialog.open(SetWarnTimerDialog, {
			width: "500px",
			panelClass: "CenterDialog",
			data: { type: "kick", name: user.name }
		});
		dialogRef.afterClosed().subscribe(error => {
			if (error){
				this.kickUser(this.idchat, user.id);
			}
		})
	}

	public setadmin(user: IUserInChatDetails) {
		if (user.isadmin == "0") {
			const dialogRef = this.dialog.open(SetWarnTimerDialog, {
				width: "500px",
				panelClass: "CenterDialog",
				data: { type: "admin", name: user.name }
			});
			dialogRef.afterClosed().subscribe(error => {
				if (error){
					this.changeUserState('switchAdmin', true, this.idchat, user.id)
				}
				
			})
		}
		else if (user.isadmin == "1") {
			const dialogRef = this.dialog.open(SetWarnTimerDialog, {
				width: "500px",
				panelClass: "CenterDialog",
				data: { type: "unadmin", name: user.name }
			});
			dialogRef.afterClosed().subscribe(error => {
				if (error){
					this.changeUserState('switchAdmin', false, this.idchat, user.id)
				}
			})
		}
	}

	public onDeleteChat() {
		const dialogRef = this.dialog.open(SetWarnTimerDialog, {
			width: "500px",
			panelClass: "CenterDialog",
			data: { type: "deletechat", name: this.namechat }
		});
		dialogRef.afterClosed().subscribe(ret => {
			if (ret){
				this.socket.emit('destroyRoom', this.idchat)
			}
			
		})
	}

	public setPrivate() {
		const passwordfield = this.form.get('password')
		const lockedcheckbox = this.form.get('islocked')
		if (this.form.value.isprivate) {
			passwordfield?.clearValidators();
			passwordfield?.reset();
			lockedcheckbox?.reset();
			lockedcheckbox?.disable();
		}
		else {
			lockedcheckbox?.enable();
		}
	}


	public setLocked() {
		const passwordfield = this.form.get('password')
		if (this.form.value.islocked)
			passwordfield?.setValidators(Validators.required);
		else {
			passwordfield?.clearValidators();
			passwordfield?.reset();
		}
	}
	
	public async edit() {
		this.form = new FormGroup({
			id: new FormControl(this.idchat),
			name: new FormControl(this.room.name,[Validators.required, Validators.minLength(1)]),
			isprivate: new FormControl(this.room.isprivate),
			islocked: new FormControl(this.room.islocked),
			password: new FormControl()
		})
		this.setPrivate();
		this.setLocked();
		this.editSetting = 1;
		await this.sleep(100);
		let setting = document.getElementById("settingcontent");
		if (setting) {
			setting!.scrollTop = setting!.scrollHeight;
		}
	}

	public onEdit() {
		if (this.form.valid) {
			const result: ICreateChatMore  = {
				id: this.form.value.id,
				name: this.form.value.name,
				isprivate: this.form.value.isprivate,
				islocked: this.form.value.islocked ? this.form.value.islocked : false,
				password: this.form.value.password 
			}
			this.socket.emit("updateRoomInfo", result);
			this.editSetting = 0;
			this.displaySetting = 0;
		}
	}

	public selectUserToAdd(id: any) {
		if (this.userToAdd.find(uid => uid == id)) {
			this.userToAdd.forEach((element, index) => {
				if (element === id) {
					this.userToAdd.splice(index, 1);
				}
			})
		}
		else {
			this.userToAdd.push(id);

		}
	}

	public addUserOnChat() {
		this.socket.emit("addUsersToRoom", {usersID: this.userToAdd, roomID: this.idchat});
		this.userToAdd = [];
		this.editSetting = 0;
		this.displaySetting = 0;
	}

	public onCancel() {
		this.editSetting = 0;

	}

	public kickUser(chatID: number, targetUserID: number) {
		this.socket.emit('kickUser', { idUser: targetUserID, idChat: chatID})
	}

	public addFriend(id: any) { this.onAddFriend.emit(id); }
	public removeFriend(id: any) { this.onRemoveFriend.emit(id); }
	public blockUser(id: any) { this.onBlockUser.emit(id); }
	public unBlockUser(id: any) { this.onUnBlockUser.emit(id); }
	public inviteUser(id: number) { this.onInviteUser.emit(id); }
	public goToProfilePage(id: any) { this.ongoToProfilePage.emit(id); }
}

@Component({
	selector: 'setwarndialog.dialog',
	templateUrl: 'setwarndialog.dialog.html',
})
export class SetWarnTimerDialog implements OnInit {
	constructor(
		public dialogRef: MatDialogRef<SetWarnTimerDialog>,
		@Inject(MAT_DIALOG_DATA) public data: DialogData,
	) {}

	ngOnInit(): void {
		
	}

	public time: number = 10;
	public inc: number = 0;

	public unit: string[] = ["second", "minute", "hour", "day"];

	onNoClick(): void {
		this.dialogRef.close();
	}

	reiniTime() :void {
		if (this.inc == 0) {
			this.time = 10;
		}
		else {
			this.time = 1;
		}
	}

	public calculatetime(): number {
		var result: number = 0;

		if (this.inc == 0) {
			result = this.time;
		}
		else if (this.inc == 1) {
			result = this.time * 60;
		}
		else if (this.inc == 2) {
			result = this.time * 3600;
		}
		else if (this.inc == 3) {
			result = this.time * 86400;
		}

		return result;
	}
}
