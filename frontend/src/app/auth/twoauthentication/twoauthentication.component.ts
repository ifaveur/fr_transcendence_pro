import { Component, OnInit } from '@angular/core';
import { FormControl, NgForm, ReactiveFormsModule} from '@angular/forms'
import { Router } from '@angular/router';
import { env } from 'src/app/global';
import { BadCodeDialog, Dialog, DialogComponent } from './dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { delay } from 'rxjs';
import { Logger } from '@nestjs/common';
import axios from 'axios';

@Component({
  selector: 'app-twoauthentication',
  templateUrl: './twoauthentication.component.html',
  styleUrls: ['./twoauthentication.component.scss']
})
export class TwoauthenticationComponent implements OnInit {

  code = new FormControl('');
  logged:string = "not 2fa activated";
  state : boolean = false;
  count: number = 0;


  constructor(private router:Router, private dialog:MatDialog) { 
  }

  ngOnInit(): void {
    this.dialog.open(Dialog);
    this.sendMail()
  }

  async sendMail(): Promise<void>
  {
    axios.get(env.back_domain_url + '/send-mail', {withCredentials: true})
    .then(() => {});
      if (this.state == false) {
      this.state = true;
      this.count = 10;
      for (let index = 0; index < 10; index++) {
        await new Promise(f => setTimeout(f, 1000));
        this.count--;
      }
      this.state = false;
    }

  }

  receiveCode() : void
  {
    axios.post(env.back_domain_url + '/send-mail/verif-code'
    , {'code' :this.code.value}
    , {withCredentials : true , headers: {
      'Content-Type':'application/json'
    }})
    .then(Answer => {
      if (Answer.data == true)
      {
        this.router.navigate(['/home']);
      }
      else
      {
        this.dialog.open(BadCodeDialog);
      }
    })
  }

}
