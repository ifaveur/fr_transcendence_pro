import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { status2FA } from 'src/global-var/global-var.service';
import { Auth42Guard } from '../guards/auth42.guard';
import { JwtGuard } from '../guards/jwt.guard';



@UseGuards(JwtGuard)
@Controller('send-mail')
export class TwoFactorAuthenticationController {
    constructor(private tfa: TwoFactorAuthenticationService) {}
    
    

    @Get()
    sendMail(@Req() req) : void
    {
        this.tfa.sendMail(req);
    }

    @Post('verif-code')
    async verifCode(@Body() body:{code:string},@Req() req,  @Res({passthrough: true }) res) : Promise<boolean>
    {
        return await this.tfa.verifCode(body, req, res);
    }

   

    @Get('status-2fa')
    async getStatus2FA(@Req() req,  @Res({ passthrough: true }) res) : Promise<status2FA>
    {
       return await this.tfa.getStatus2fa(req);
    }

}
