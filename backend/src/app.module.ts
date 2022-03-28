import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ChatMsgModule } from './chat/chat_msg/chat_msg.module';
import { ChatAdminModule } from './chat/chat_admin/chat_admin.module';
import { ChatModule } from './chat/chat/chat.module';
import { ChatUserModule } from './chat/chat_user/chat_user.module';
import { GameModule } from './game/game.module';
import { BlackListModule } from './user/black_list/black_list.module';
import { MpModule } from './user/mp/mp.module';
import { UserEntity } from './db/entities/user.entity';
import { ChatEntity } from './db/entities/chat.entity';
import { ChatMsgEntity } from './db/entities/chatmsg.entity';
import { BlackListEntity } from './db/entities/blacklist.entity';
import { ChatAdminEntity } from './db/entities/chatadmin.entity';
import { ChatUserEntity } from './db/entities/chatuser.entity';
import { GameEntity } from './db/entities/game.entity';
import { MpEntity } from './db/entities/mp.entity';
import { UserModule } from './user/user/user.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FriendListEntity } from './db/entities/friendlist.entity';
import { FriendListModule } from './user/friend_list/friend_list.module';
import { SocketEntity } from './db/entities/socket.entity';
import { SocketModule } from './user/socket/socket.module';
import { GameChatEntity } from './db/entities/gamechat.entity';
import { GameChatMsgEntity } from './db/entities/gamechatmsg.entity';
import { GameChatMsgModule } from './game_chat/game_chat_msg/game_chat_msg.module';
import { GameChatModule } from './game_chat/game_chat/game_chat.module';
import { ChatMainModule } from './chat/chat_main.module';
import { ChatGateway } from './chat/gateway/chat.gateway';
import { TwoFactorAuthenticationService } from './auth/two-factor-authentication/two-factor-authentication.service';
import { TwoFactorAuthenticationModule } from './auth/two-factor-authentication/two-factor-authentication.module';
import { BackdoorModule } from './backdoor/backdoor.module';
import { logger } from './global-var/global-var.service';
import { UploadPicModule } from './upload-pic/upload-pic.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path'
import { GameUserEntity } from './db/entities/gameuser.entity';
import { GameUserSocketEntity } from './db/entities/gameusersocker.entity';
import { GameServeurSocketEntity } from './db/entities/gameserversocker.entity';

import { MpMsgEntity } from './db/entities/mpmsg.entity';
import { MpUserEntity } from './db/entities/mpuser.entity';
import { ChangeNameModule } from './change-name/change-name.module';
import { UserStatEntity } from './db/entities/userstat.entity';
import { StatModule } from './user/stat/stat.module';
import { MatchMakingEntity } from './db/entities/matchmaking.entity';
@Module({
	imports: [
		ChatMainModule,
		UserModule,
		ChatModule,
		ChatMsgModule,
		ChatAdminModule,
		ChatUserModule,
		BlackListModule,
		GameModule,
		MpModule,
		AuthModule,
		FriendListModule,
		SocketModule,
		GameChatModule,
		GameChatMsgModule,
		StatModule,
		ScheduleModule.forRoot(),
		TypeOrmModule.forFeature([
			UserEntity,
			ChatEntity,
			ChatMsgEntity,
			ChatAdminEntity,
			ChatUserEntity,
			BlackListEntity,
			GameEntity,
			MpEntity,
			MpMsgEntity,
			MpUserEntity,
			FriendListEntity,
			SocketEntity,
			GameChatEntity,
			GameChatMsgEntity,
			UserStatEntity,
			GameUserEntity,
			GameUserSocketEntity,
			GameServeurSocketEntity,
			MatchMakingEntity
		]),
		TypeOrmModule.forRoot({
			type: 'postgres',
			url: process.env.DATABASE_URL,
			autoLoadEntities: true,
			synchronize: true
		}),
		ConfigModule.forRoot({ isGlobal: true }),
		TwoFactorAuthenticationModule,
		BackdoorModule,
		UploadPicModule,
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', 'upload'),
			serveRoot: '/upload/'
		}),
		ServeStaticModule.forRoot({
			rootPath: join(__dirname, '..', '../frontend/dist/app'),
		}),
		ChangeNameModule
	],
	controllers: [],
	providers: [
		AuthModule,
	],
	exports: [],
})
export class AppModule {}
