import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import axios from 'axios';
import { env } from 'src/app/global';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private router : Router) { }

  ngOnInit(): void {
  }

  logout()
  {
    axios.get(env.back_domain_url + '/auth/logout', {withCredentials: true})
    .then(() => this.router.navigate(['/auth']))
  }
}
