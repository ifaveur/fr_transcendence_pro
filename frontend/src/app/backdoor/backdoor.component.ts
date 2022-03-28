import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import axios from 'axios';
import { env } from '../global';

@Component({
  selector: 'app-backdoor',
  templateUrl: './backdoor.component.html',
  styleUrls: ['./backdoor.component.scss']
})
export class BackdoorComponent implements OnInit {

  login = new FormControl('');
  constructor( private router:Router) { }

  ngOnInit(): void {
  }

  async createUser()
  {
    axios.post(env.back_domain_url + '/backdoor', {login: this.login} , {withCredentials: true})
    .then(() => this.router.navigate(['/home']));
  }
}
