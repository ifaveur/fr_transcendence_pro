import { Module } from '@nestjs/common';
import { TwoFactorAuthenticationController } from './two-factor-authentication.controller';
import { TwoFactorAuthenticationService } from './two-factor-authentication.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

import { UserModule } from 'src/user/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: "gmail",
        auth: {
          user: process.env.MAIL,
          pass: process.env.PASS_MAIL,
        }, 
      },      
      defaults: {
        from: "No Reply" + process.env.MAIL,
        secure: false,
      },
      preview: true,
      template: {
        dir: process.cwd() + '/template/',
        adapter: new PugAdapter(),
        options: {
          strict: false,
        },
      },
    }),
    UserModule,
    AuthModule,
  ],
  controllers: [TwoFactorAuthenticationController],
  providers: [TwoFactorAuthenticationService],
})
export class TwoFactorAuthenticationModule {}