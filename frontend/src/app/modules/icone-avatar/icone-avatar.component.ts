import { Component, Input, OnChanges, OnInit, SimpleChange, SimpleChanges } from '@angular/core';
import { IUser } from 'src/app/interfaces/user.interface';
import { env } from 'src/app/global';
import axios from 'axios';

@Component({
  selector: 'app-icone-avatar',
  templateUrl: './icone-avatar.component.html',
  styleUrls: ['./icone-avatar.component.scss']
})
export class IconeAvatarComponent implements OnInit, OnChanges {

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    axios.get(env.back_domain_url + '/users/me', {withCredentials : true})
    .then(answer => this.url_img = answer.data.image_url)
  }

  url_img!: string | undefined
  @Input() user!: IUser;


    ngOnInit(): void {
    axios.get<{image_url:'code'}>(env.back_domain_url + '/users/me', {withCredentials : true})
    .then(answer => this.url_img =  answer.data.image_url)
  }

}