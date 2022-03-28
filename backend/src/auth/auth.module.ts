import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './guards/jwt.guard';
import { Auth42Guard } from './guards/auth42.guard';
import { JwtStrategy } from './guards/jwt.strategy';
import { Auth42Strategy } from './guards/auth42.strategy';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { UserModule } from 'src/user/user/user.module';
import { UserService } from 'src/user/user/user.service';

import { forwardRef } from '@nestjs/common';

@Module({
  imports: [
	ConfigModule.forRoot({ isGlobal: true }),
	UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '8h',
      },
    }),
    forwardRef(() => UserModule)
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    Auth42Strategy,
    JwtGuard,
    Auth42Guard,
	AuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
