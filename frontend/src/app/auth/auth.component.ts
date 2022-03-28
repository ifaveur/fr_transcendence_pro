import { Component, OnInit } from '@angular/core';
import { IUser } from 'src/app/interfaces/user.interface'
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { env } from '../global';
import axios from 'axios';



@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
   public name!: string;
   public logged: string = "login";

   constructor(
     	   private router: Router,
	) {}

  ngOnInit(): void {
    this.init();
  }

  async init() : Promise<void> {
    var logged!:boolean;
    await this.isLogged().then(value => logged = value)
    if (logged)
    {
      
        axios.get(
        env.back_domain_url + "/users/username",
        {responseType: 'text' , withCredentials: true})
        .then( Username => this.setUsernameAndLog(Username.data))
    }
  }

   getLog(name: string) : void {
    if (name != "NoName")
    {
      this.logged = "logout"
    }
    else
    {
      this.logged = "login"
    }
  }

  setUsernameAndLog(name : string) : void {
    this.name = name;
    this.getLog(name)
  }

  login() : void
  {
    if (!this.name) {
        window.location.href = env.auth;
    }
  }

    async isLogged() : Promise<boolean>
    {
      var logged!:boolean

      await  axios.get(env.back_domain_url + "/logged"
      , { withCredentials: true})
      .then(isLogged => logged = isLogged.data)

      return (logged);
    }

	public async isLoggedIfNotRedir() {
		if (await this.isLogged() === false) {
			this.router.navigate(['./auth'])
			return false
		}
		return true
	}

	async getMe(): Promise<IUser> {
		var me!:Promise<IUser>
		await axios.get(env.back_domain_url + "/users/me"
		, { withCredentials: true})
		.then(user => me = user.data)
    .catch()
		return (me);
	}

	async getmyID(): Promise<number> {
		const me = await this.getMe();
		const id:number | undefined = me['id']
		if (typeof(id) === "number") {
			return (id)
		} else {
			return 0
		}
	}

}
