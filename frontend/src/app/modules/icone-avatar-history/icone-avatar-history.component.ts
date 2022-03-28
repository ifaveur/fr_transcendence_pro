import { Component, OnChanges, OnInit, Input, SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-icone-avatar-history',
  templateUrl: './icone-avatar-history.component.html',
  styleUrls: ['./icone-avatar-history.component.scss']
})
export class IconeAvatarHistoryComponent implements OnInit {

  @Input() public pic!: string;
  constructor() { }


    ngOnInit(): void {
      this.pic = this.pic;
  }
}
