import { Injectable, Inject, forwardRef, Res } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { UserService } from 'src/user/user/user.service';
import { AuthService } from 'src/auth/auth.service';
import { logger, status2FA } from 'src/global-var/global-var.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TwoFactorAuthenticationService {
  constructor(
    private readonly mailerService: MailerService,
    private userService: UserService,
    private authService: AuthService,
) {}

    saltOrRounds = 12;

     size_code:number = 4;

  public sendMail(req): void {
      this.userService.getMe(req).then(User => this.sendmail(User['email'], req))
  }
  
  public async sendmail(email:string, req) : Promise<void>
  {
    var code:string;
    code = this.code2fa();
    this.userService.insertCode2fa(await bcrypt.hash(code, this.saltOrRounds), req);
      try {this.mailerService
      .sendMail({
        to: email, // list of receivers
        from: process.env.MAIL, // sender address
        subject: code + ' : Your authentification code for the best pong game.', // Subject line
        text: '2FA', // plaintext body
        html: "<strong>If you are not the applicant of this code. Remember to change your password on the intra42.</strong>" // HTML body content
      })
      .then()
      .catch();
    }
    catch {
    }
  }

  public cleanCode(req) : void 
  {
    this.userService.cleanCode2fa(req);
  }

  public getCode(req) : Promise<string>
  {
    return (this.userService.getCode2Fa(req))
  }

  public getStatus2fa(req) : Promise<status2FA>
  {

    return (this.authService.fromTokenToStatus2fa(req.cookies['access_token']))
  }

  public async verifCode(body:{code:string}, req,  @Res({passthrough: true }) res) : Promise<boolean>
  {
    if (body.code.length == this.size_code  && await(bcrypt.compare(body.code, await this.getCode(req))))
    {
        this.authService.createValidCookie(req,res);
        this.cleanCode(req);
        return (true)
    }
    return (false);
  }
  private code2fa() : string {
      var str_code: string = "";
  
      var characters = "0123456789";
      for (var i = 0 ; i < this.size_code; i++)
      {
          str_code += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      return (str_code)
      
  }
}

