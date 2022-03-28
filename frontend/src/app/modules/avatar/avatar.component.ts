import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { IUser } from 'src/app/interfaces/user.interface';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Socket } from 'socket.io-client';
import { env } from 'src/app/global';
import { socketType } from '../general/home/home.component';
import axios from 'axios';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss']
})
export class AvatarComponent implements OnInit , OnChanges {
  
  @Input() user!:IUser
  @Input() socket!: socketType;

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {  
    axios.get(env.back_domain_url + '/users/me', {withCredentials : true})
    .then(answer => this.url_img =  answer.data.image_url)
  }
  url_img!: string | undefined



    ngOnInit(): void {
  }
}
