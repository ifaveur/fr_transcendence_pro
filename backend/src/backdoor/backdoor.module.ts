import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { JwtStrategy } from 'src/auth/guards/jwt.strategy';
import { ChatAdminModule } from 'src/chat/chat_admin/chat_admin.module';
import { GameService } from 'src/game/game.service';
import { GameChatService } from 'src/game_chat/game_chat/game_chat.service';
import { BlackListService } from 'src/user/black_list/black_list.service';
import { FriendListService } from 'src/user/friend_list/friend_list.service';
import { MpService } from 'src/user/mp/mp.service';
import { SocketService } from 'src/user/socket/socket.service';
import { StatService } from 'src/user/stat/stat.service';

import { UserService } from 'src/user/user/user.service';
import { BackdoorController } from './backdoor.controller';

@Module({
  imports: [
	  ChatAdminModule,
	  JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: {
			expiresIn: '8h',
			},
  		}),
	],
  controllers: [BackdoorController],
  providers: [
	  JwtStrategy, 
	UserService,
	GameChatService,
	AuthService,
	SocketService,
	FriendListService,
	BlackListService,
	MpService,
	StatService,
	GameService,
]
})
export class BackdoorModule {}
