import { Module } from '@nestjs/common';
import { ChatAdminService } from 'src/chat/chat_admin/chat_admin.service'
import { ChatService } from 'src/chat/chat/chat.service'
import { ChatUserService } from 'src/chat/chat_user/chat_user.service'
import { ChatMsgService } from 'src/chat/chat_msg/chat_msg.service'
import { UserModule } from 'src/user/user/user.module'
import { AuthModule } from 'src/auth/auth.module'
import { ChatGateway } from 'src/chat/gateway/chat.gateway'
import { LoggerService } from 'src/logger/logger.service'
import { SocketService } from 'src/user/socket/socket.service'
import { MpService } from 'src/user/mp/mp.service';
import { FriendListService } from 'src/user/friend_list/friend_list.service';
import { BlackListService } from 'src/user/black_list/black_list.service';
import { GameService } from 'src/game/game.service';
import { StatService } from 'src/user/stat/stat.service';
import { GameChatService } from 'src/game_chat/game_chat/game_chat.service';
import { GameChatMsgService } from 'src/game_chat/game_chat_msg/game_chat_msg.service';
import { MatchMakingService } from 'src/game/matchmaking.service';

@Module({
	imports: [
		AuthModule,
		UserModule,
	],
	providers: [
		GameChatMsgService,
		GameChatService,
		ChatGateway,
		ChatAdminService,
		ChatService,
		ChatMsgService,
		ChatUserService,
		MpService,
		FriendListService,
		BlackListService,
		LoggerService,
		SocketService,
		GameService,
		StatService,
		MatchMakingService
	],
	exports: []
  })
  export class ChatMainModule { }
  