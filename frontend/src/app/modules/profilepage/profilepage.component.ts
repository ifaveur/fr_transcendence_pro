import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser } from 'src/app/interfaces/user.interface';
import { Location } from '@angular/common';
import { PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { OnChanges } from '@angular/core';
import { Url } from 'url';
import { socketType } from '../general/home/home.component';

@Component({
	selector: 'app-profilepage',
	templateUrl: './profilepage.component.html',
	styleUrls: ['./profilepage.component.scss']
})
export class ProfilepageComponent implements OnInit , OnChanges, OnDestroy {

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


	profileUser!:IUser;
	public id:number = 0;
	event: any;


	constructor(
		private location:Location,
		private router: Router
	) { }

	ngOnChanges(changes: SimpleChanges): void {
	}

	ngOnInit(): void {
		this.event = this.router.events.subscribe(() => {
			this.parseUrl();
		})
		this.socket.on('fgetUserById', this.getUser)
		this.parseUrl();


	}

	public async resizeName() {
		await this.sleep(200)
		let div = document.getElementById("username");
		let size = 400 / this.profileUser.name.length;
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

	public parseUrl() {
		const tree: UrlTree = this.router.parseUrl(this.location.path());
		const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
		const s: UrlSegment[] = g.segments;
		if (s && s.length >= 1) {
			const id = Number(s[1])
			if (id != this.id) {
				this.id = id;
				this.socket.emit('getUserById', this.id);
			}
		}
	}
	

	public getUser = (user: IUser) => {
		this.profileUser = user;
		this.resizeName();
	}

	ngOnDestroy() : void {
		this.socket.off('fgetUserById', this.getUser)
		this.event.unsubscribe()
	}

	public addFriend(id: any) { this.onAddFriend.emit(id); }
	public removeFriend(id: any) { this.onRemoveFriend.emit(id); }
	public blockUser(id: any) { this.onBlockUser.emit(id); }
	public unBlockUser(id: any) { this.onUnBlockUser.emit(id); }
	public inviteUser(id: number) { this.onInviteUser.emit(id); }
	public goToProfilePage(id: any) { this.ongoToProfilePage.emit(id); }

}
