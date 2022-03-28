import { Controller, Post, UploadedFile, UseInterceptors, Req, UseGuards } from '@nestjs/common';
import { ExpressAdapter, FileInterceptor } from '@nestjs/platform-express';
import { logger } from 'src/global-var/global-var.service';
import { diskStorage } from 'multer';
import { UploadPicService } from './upload-pic.service';
import { UserService } from 'src/user/user/user.service';
import { Auth42Guard } from 'src/auth/guards/auth42.guard';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
const fs = require('fs')

function randomName()
{
    var alphabet:string = "qwertopasfjklzxcvbnm"
    var randomName:string = "";

    for (var i:number= 0; i < 16; i++)
    {
        randomName += alphabet.charAt(Math.floor(Math.random() * alphabet.length))
    }
    return (randomName);
}

@UseGuards(JwtGuard)
@Controller('upload')
export class UploadPicController {

    constructor(private userService: UserService, private uploadPicService: UploadPicService)
    {() =>  {
        if (!fs.existsSync('./upload'))
            fs.mkdirSync('./upload')}}


    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
                destination: './upload',
            filename: (req, file, cb) => {
                cb(null, randomName() +  '.' + file.originalname.split(".")[file.originalname.split(".").length - 1])
            }
            ,
        }),
        limits: {
            fileSize: 2097152 // 2mo
        },
        fileFilter: (req, file, cb) =>
        {
            var authorized_mimes_type = 
            [
                "image/png",
                "image/jpg",
                "image/gif",
                "image/jpeg",
                "image/webp"
            ]
            if (authorized_mimes_type.find(element => file.mimetype == element))
            {
                cb(null, true);
            }
            else 
            {
                cb(null, false);
            }
        }
    }),)
    uploadFile(@Req() req, @UploadedFile() file):  void|string
    {
        if (file) (
        this.userService.getMe(req).then(answer => {
            try {
                fs.unlink(answer.image_url);
            }
            catch {   
            }
            this.userService.setImgUrl(req, file.path)
        }))
        else 
        {
            return ("Error when upload, bad name extension. The extensions accepted are : Jpg/Jpeg/gif/Webp")
        }
    }
}
