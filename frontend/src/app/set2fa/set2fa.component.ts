import { Component, OnInit } from '@angular/core';
import axios from 'axios';
import { env } from '../global';

@Component({
  selector: 'app-set2fa',
  templateUrl: './set2fa.component.html',
  styleUrls: ['./set2fa.component.scss']
})
export class Set2faComponent implements OnInit {

  constructor() { }
  twofa!: boolean;

  ngOnInit(): void {
    axios.get(env.back_domain_url + '/users/me', {withCredentials : true})
    .then(answer => this.get2fa(answer.data))
  }

  async set2fa() : Promise<void>
  {
    axios.post(env.back_domain_url + '/users/2fa', {'bool': this.twofa } ,{withCredentials : true, headers: {
      'Content-Type':'application/json'}})
    .then();
    
  }
  get2fa(user:any)
  {
    this.twofa = user.is2FA;
  }

}
