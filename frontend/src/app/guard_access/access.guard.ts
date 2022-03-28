import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import { status2FA } from '../global';
import { env } from '../global';


/*
Guard who redirect you if you are not logged.
*/

@Injectable()
export class RolesGuard implements CanActivate {

    constructor(private router: Router) {}

    async isLogged() : Promise<boolean>
    {
      var islogged!:boolean

      await  axios.get(env.back_domain_url + '/logged'
      , { withCredentials: true})
      .then(is_logged => islogged = is_logged.data)
      .catch(() => islogged = false)
      return (islogged);
    }

    async pending2FA() : Promise<string>
    {
      var status2fa!:string; 

      await axios.get(env.back_domain_url + '/send-mail/status-2fa'
      , { withCredentials: true, responseType: 'text'})
      .then(returnVal => status2fa = returnVal.data)
      .catch(returnErr =>console.log(returnErr))
      return status2fa;
      
    }

  async canActivate(
  ): Promise<boolean> {
    var logged!:boolean;
    var isPending2FA!:string;
    await this.isLogged().then(is_logged => logged = is_logged)
    if (logged === false) {
        this.router.navigate(['./auth'])
    }
    else 
    {
      await this.pending2FA().then(returnVal => isPending2FA = returnVal)
      if (isPending2FA == status2FA.ValidationPending)
      {
        this.router.navigate(['/2fa'])
      }
    }
    return (logged);
  }
}