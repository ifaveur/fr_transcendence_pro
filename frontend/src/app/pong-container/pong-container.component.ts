import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PRIMARY_OUTLET, Router, UrlSegment, UrlSegmentGroup, UrlTree } from '@angular/router';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser } from '../interfaces/user.interface';
import { IChatMsg, IGameChatMsg } from '../interfaces/msg.interface';
import { Location } from '@angular/common';
import { socketType } from '../modules/general/home/home.component';

@Component({
	selector: 'app-pong-container',
	templateUrl: './pong-container.component.html',
	styleUrls: ['./pong-container.component.scss']
})
export class PongContainerComponent implements OnInit, OnDestroy {
		
	@Input() public socket!: socketType;
	@Input() public user!: IUser
	
	public gameid: number =  0;
	public inviteUser: number =  0;
	public chatid: number = 0;
	public msgList: IGameChatMsg[] = [];
	@Input() public friendListid: number[] = [];
	@Input() public blackListid: number[] = [];
	
	event: any;
	
	
	constructor(
		private location: Location,
		private router: Router
	) { }

	public createGameChatListener = (id: number) => {
		this.chatid = id;
		this.msgList = []
	}

	public joinGameChatListener = (data: {msg : IGameChatMsg[], id: number}) => {
		this.msgList = data.msg;
		this.chatid = data.id;
	}

	public endGameListener = () => {
		this.chatid = 0;
	}

	ngOnDestroy(): void {
		this.event.unsubscribe()
		this.socket.off("createdGameChat", this.createGameChatListener)
		this.socket.off("joinedGameChat", this.joinGameChatListener)
		this.socket.off("destroyChat", this.endGameListener)
	}

	ngOnInit(): void {
		this.event = this.router.events.subscribe(() => {
			this.parseUrl();
		})
		this.parseUrl();
		this.socket.on("createdGameChat", this.createGameChatListener)
		this.socket.on("joinedGameChat", this.joinGameChatListener)
		this.socket.on("destroyChat", this.endGameListener)
	}

	public parseUrl() {
		const tree: UrlTree = this.router.parseUrl(this.location.path());
		const g: UrlSegmentGroup = tree.root.children[PRIMARY_OUTLET];
		const s: UrlSegment[] = g.segments;
		if (s && s.length === 2) {
			this.inviteUser = 0;
			const id = Number(s[1])
			if (id != this.gameid) {
				this.gameid = id;
			}
		}
		else if (s && s.length >= 3) {
			this.gameid = 0;
			if (String(s[1]) === "invite") {
				const id = Number(s[2])
				if (id != this.inviteUser) {
					this.inviteUser = id;
				}
			}
		}
		else{
			this.gameid = 0;
			this.inviteUser = 0;
		}
	}

}
