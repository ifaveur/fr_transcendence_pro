import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IGameList, IGameListObject } from 'src/app/interfaces/game.interface';
import { IUser } from 'src/app/interfaces/user.interface';
import { socketType } from '../home.component';

@Component({
	selector: 'app-homegamelist',
	templateUrl: './homegamelist.component.html',
	styleUrls: ['./homegamelist.component.scss']
})
export class HomegamelistComponent implements OnInit, OnDestroy {

	@Input() public socket!: socketType;
	@Input() public user!: IUser

	public waintingList: IGameList[] = [];
	public progressList: IGameList[][] = [];

	constructor(
		private router: Router
	) { }

	public updateGameListListener = (data: IGameListObject) => {
		this.waintingList = data.waiting;
		this.progressList = [];

		data.progress.forEach(raw => {
			if (this.progressList.length == 0) {
				this.progressList.push([raw]);
			}
			else {
				if (this.progressList[this.progressList.length - 1][0].id == raw.id) {
					if (this.progressList[this.progressList.length - 1].length < 2)
						this.progressList[this.progressList.length - 1].push(raw);
				}
				else {
					this.progressList.push([raw]);
				}
			}
		})

	}

	ngOnDestroy(): void {
		this.socket.off("updateGamesList", this.updateGameListListener);
	}

	ngOnInit(): void {
		this.socket.on("updateGamesList", this.updateGameListListener);
		this.socket.emit("updateGamesList");
	}

	public joinGame(id: number) {
		this.router.navigate(["/pong/" + id]);
	}


}
