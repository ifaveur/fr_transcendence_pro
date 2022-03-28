import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/db/entities/user.entity';
import { status2FA } from 'src/global-var/global-var.service';
import { StatService } from 'src/user/stat/stat.service';

@Controller('backdoor')
export class BackdoorController {
    constructor(
        private jwtService: JwtService,
		private statService: StatService,
    ) {}

    @Post()
    async createUser(@Body() body, @Res({passthrough: true}) res)
    {
        const user: UserEntity = UserEntity.create();
        user.name = body.login.value;
        user.login = randomName();
        user.email = randomName();
        user.image_url = "http://www.blog-parents.fr/maman-puissance-4/wp-content/uploads/sites/17/2014/12/IMG_1264-0.jpg"
        await user.save();
        this.statService.init(user.id);

        var token = this.jwtService.sign({ login: user.login, status2fa: status2FA.Activate})
        res.cookie('access_token', token, { httpOnly: true})

    }
}

function randomName()
{
    var characters = "qwruiopasdfhjklzxcvbnm"
    var randomName : string  = "";
    for (var i = 0 ; i < 16; i++)
    {
        randomName += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return randomName;
}
