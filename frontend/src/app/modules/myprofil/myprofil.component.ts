import { Component, Input, OnChanges, OnInit, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser } from 'src/app/interfaces/user.interface';
import { socketType } from '../general/home/home.component';


@Component({
  selector: 'app-myprofil',
  templateUrl: './myprofil.component.html',
  styleUrls: ['./myprofil.component.scss']
})
export class MyprofilComponent implements OnInit, OnChanges {

	@Input() user!:IUser;
	@Input() socket!: socketType;
	@Input() public friendListid: number[] = [];
	@Input() public blackListid: number[] = [];
	
	@Output() onAddFriend = new EventEmitter();
	@Output() onRemoveFriend = new EventEmitter();
	@Output() onBlockUser = new EventEmitter();
	@Output() onUnBlockUser = new EventEmitter();
	@Output() onInviteUser = new EventEmitter();
	@Output() ongoToProfilePage = new EventEmitter();

	constructor() { }

	ngOnInit(): void {
		this.resizeName();
	}

	ngOnChanges(changes: SimpleChanges): void {
		this.resizeName();
	}
  
	public async resizeName() {
		await this.sleep(200)
		let div = document.getElementById("username");
		let size = 400 / this.user.name.length;
		if (size > 75)
			size = 75;
		if (div)
			div.style.fontSize = size + "px";

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
