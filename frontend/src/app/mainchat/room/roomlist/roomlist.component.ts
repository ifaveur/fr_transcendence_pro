import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AuthComponent } from 'src/app/auth/auth.component';
import { IChat, UserJoinChatLockerDto } from 'src/app/interfaces/chat.interface';
import { IChatMsg } from 'src/app/interfaces/msg.interface';
import { IUser } from 'src/app/interfaces/user.interface';
import { socketType } from 'src/app/modules/general/home/home.component';

export interface IErrorJoinRoom {
	msg: string,
	roomid: number,
}

@Component({
	selector: 'app-roomlist',
	templateUrl: './roomlist.component.html',
	styleUrls: ['./roomlist.component.scss']
})
export class RoomlistComponent implements OnInit, OnDestroy, OnChanges {

	@Input() public socket!: socketType;
	@Input() public iduser: number = 0;
	@Output() closePopup = new EventEmitter();

	constructor(
		private auth: AuthComponent,
		readonly snackBar: MatSnackBar,
	) { }

	public roomList: IChat[] = [];
	public display: boolean[] = [];
	public passwordList: string[] = [];

	public password: string = ""; 

	public joinRoomSuccefuly = () => {
		this.close()
	}

	public joinRoomErrorListener = (arg: IErrorJoinRoom) => {
		this.errorPassword(arg);
	}

	public updateRoomListListener = async (data: IChat[]) => {
		if (!await this.auth.isLoggedIfNotRedir())
			return ;

		this.roomList = data;
		this.display = [];
		for(let i = 0; i < this.roomList.length; i++) {
			this.display.push(false);
			this.passwordList.push("")
		}
	} 
	
	public askUpdateAvailableRoomListListener = () => {
		this.socket.emit("updateAvailabRoomList")
	}

	ngOnInit(): void {
		this.display = [];
	
		this.socket.on("joinRoomOk", this.joinRoomSuccefuly)
		this.socket.on("joinRoomError", this.joinRoomErrorListener)



		this.socket.on("updateAvailabRoomList", this.updateRoomListListener)
		this.socket.on('_updateAvailableRoomList', this.askUpdateAvailableRoomListListener);
		
		this.socket.emit("updateAvailabRoomList")

	}

		
	ngOnChanges(changes: SimpleChanges): void {
	}

	ngOnDestroy(): void {
		this.socket.off("joinRoomOk", this.joinRoomSuccefuly);
		this.socket.off("joinRoomError", this.joinRoomErrorListener)
		this.socket.off("updateAvailabRoomList", this.updateRoomListListener)
		this.socket.off('_updateAvailableRoomList', this.askUpdateAvailableRoomListListener);

	}

	public async errorPassword(arg: IErrorJoinRoom) {
		const div = document.getElementById(arg.roomid.toString())
		div!.style.border = "2px solid rgb(145, 3, 3)";
	}

	
	public close() {
		this.closePopup.emit("");
	}

	public displaymore(id: number) {
		this.display[id] = !this.display[id];
	}

	public async joinroom(room: IChat, index:number) {
		const testconnection: UserJoinChatLockerDto = {
			idUser: this.iduser,
			idChat: room.id,
			islocked: room.islocked,
			tryPassword: this.passwordList[index],
		}
		this.socket.emit('joinRoom', testconnection);
	}

}
