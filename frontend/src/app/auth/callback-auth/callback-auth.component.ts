import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsoleLogger } from '@nestjs/common';
import axios from 'axios';
import { env } from '../../global';

@Component({
  selector: 'app-callback-auth',
  templateUrl: './callback-auth.component.html',
  styleUrls: ['./callback-auth.component.scss']
})
export class CallbackAuthComponent implements OnInit {

  constructor(private route: ActivatedRoute ,
     private router : Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(callback42 => 
      axios.get(env.back_domain_url + "/auth/login42", 
      {params: {code: callback42.code}, withCredentials: true})
      .then(() => this.router.navigate(['/home']))
      .catch(() => this.router.navigate(['/auth']),));
  }

}
