import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { IUser } from 'src/app/interfaces/user.interface';
import { env } from 'src/app/global';
import axios from 'axios';

@Component({
  selector: 'app-change-name',
  templateUrl: './change-name.component.html',
  styleUrls: ['./change-name.component.scss']
})

export class ChangeNameComponent implements OnInit {
  @Input() socket!: Socket<DefaultEventsMap,DefaultEventsMap>
  @Input() user!:IUser

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
  }

  new_name = new FormControl('');
  str_error:string = '';

  ngOnInit(): void {
  }

  newName(): void
  {
    if (this.new_name.value.length < 3 || this.new_name.value.length > 8)
    {
      this.str_error = "Please choose a new name between 3 and 8 characters"
    }
    else 
    {
    axios.post(env.back_domain_url + '/users/newname', {'name' : this.new_name.value} , {withCredentials: true , headers: {
      'Content-Type':'application/json'
    }})
    .then((value) => { 
      if (value.data == false)
      {
        this.str_error = "Pseudo already used"
      }
      else {
      this.socket.emit("updatedProfil");
      this.str_error = "New pseudo set !"
      }
    }
    ) ;
  }
  }

}
