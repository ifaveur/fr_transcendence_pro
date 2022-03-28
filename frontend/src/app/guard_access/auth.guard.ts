import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { status2FA } from '../global';
import { functionsGuard } from './functions.services';
import { env } from '../global';
import axios from 'axios';


/*
Guard who redirect you if you are logged and on the auth page.
*/

@Injectable()
export class AlreadyLoggedGuard implements CanActivate {

    constructor(private router: Router) {}

    async isLogged() : Promise<boolean>
    {

        var islogged!:boolean
      await  axios.get(env.back_domain_url + '/logged'
      , {withCredentials: true})
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
    if (logged)
      await this.pending2FA().then(returnVal => isPending2FA = returnVal)
    if (logged === true && isPending2FA != status2FA.ValidationPending)
    {
        this.router.navigate(['./home'])
    }
    if (logged && isPending2FA == status2FA.ValidationPending)
      return (logged)
    return (!logged);
  }
}