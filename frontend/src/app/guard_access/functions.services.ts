import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import { env } from '../global';


export class functionsGuard{

    constructor() {}

    async   isLogged() : Promise<boolean>
    {
        var test!:boolean
        await  axios.get(env.back_domain_url + '/logged'
        , {withCredentials: true})
        .then(is_logged => test = is_logged.data)
        .catch(Fail => test = false)
        return (test);
    }

    async  pending2FA() : Promise<string>
    {
        var status2fa!:string; 

        await axios.get(env.back_domain_url + '/send-mail/status-2fa'
        , { withCredentials: true, responseType: 'text'})
        .then(returnVal => status2fa = returnVal.data)
        .catch(returnErr =>console.log(returnErr))
        return status2fa;
    
    }
}