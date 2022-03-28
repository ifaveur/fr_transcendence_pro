import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser } from 'src/app/interfaces/user.interface';
import { Location } from '@angular/common';
import { PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { IChatMsg, IGameChatMsg, ISocketMsg } from 'src/app/interfaces/msg.interface';
import { socketType } from 'src/app/modules/general/home/home.component';

@Component({
	selector: 'app-game-chat',
	templateUrl: './game-chat.component.html',
	styleUrls: ['./game-chat.component.scss']
})
export class GameChatComponent implements OnInit, OnDestroy {

	
	@Input() public socket!: socketType;
	@Input() public user!: IUser
	@Input() public chatid: number = 0
	@Input() public msgList: IGameChatMsg[] = []
	@Input() public friendListid: number[] = [];
	@Input() public blackListid: number[] = [];

	public msginput: string = "";
	

	constructor(
		private location: Location,
		private router: Router
	) { }
	ngOnDestroy(): void {
		this.socket.off("addChatGameMsg", this.addMessageListener);
	}

	public addMessageListener = (data: any) => {
		this.addMessageCallBack(data)
	}

	ngOnInit(): void {
		this.socket.on("addChatGameMsg", this.addMessageListener);

	}

	public async addMessageCallBack(message: any) {
		this.msgList.push(message);
		this.scrollToBottom();
	}

	public async onSubmit(fmp: NgForm) {
		if (!fmp.value.message || !fmp.value.message.length)
			return ;
		this.handleSubmitNewMessage(fmp.value.message)
		fmp.reset();
	}

	public async handleSubmitNewMessage(msg: string): Promise<void> {
		let val: ISocketMsg = {
			message: msg,
			idUser: this.user.id,
			idChat: this.chatid
		}
		this.socket.emit('addChatGameMsg', val);
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
	  
}
