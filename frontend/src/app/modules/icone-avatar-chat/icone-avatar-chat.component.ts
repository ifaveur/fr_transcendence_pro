import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-icone-avatar-chat',
  templateUrl: './icone-avatar-chat.component.html',
  styleUrls: ['./icone-avatar-chat.component.scss']
})
export class IconeAvatarChatComponent implements OnInit {

  @Input() public pic!: string;
  constructor() { }


    ngOnInit(): void {
      this.pic = this.pic;
  }
}
