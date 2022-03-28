import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RoomComponent } from './mainchat/room/room.component';
import { AuthComponent } from './auth/auth.component';
import { GameInviteDialog, HomeComponent, tooMuchWindowOpenDialog } from './modules/general/home/home.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { TwoauthenticationComponent } from './auth/twoauthentication/twoauthentication.component';
import { Set2faComponent } from './set2fa/set2fa.component';
import { ProfilepageComponent } from './modules/profilepage/profilepage.component';
import { BackdoorComponent } from './backdoor/backdoor.component';
import { ChatComponent, SetWarnTimerDialog } from './mainchat/chat/chat.component';
import { CreateroomComponent } from './mainchat/room/createroom/createroom.component';
import { RoomlistComponent } from './mainchat/room/roomlist/roomlist.component';
import { confirmSwitchInterfaceDialog, NavbarComponent } from './navbar/navbar.component';

import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatInputModule } from '@angular/material/input'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule} from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AvatarComponent } from './modules/avatar/avatar.component';
import { UploadPicComponent } from './modules/upload-pic/upload-pic.component';
import { IconeAvatarComponent } from './modules/icone-avatar/icone-avatar.component';
import { IconeAvatarChatComponent } from './modules/icone-avatar-chat/icone-avatar-chat.component';
import { ChangeNameComponent } from './modules/profilepage/change-name/change-name.component';
import { ChatselectorComponent } from './mainchat/chatselector/chatselector.component';
import { StatselectorComponent } from './stat/statselector/statselector.component';
import { Statgraph1Component } from './stat/statgraph1/statgraph1.component';
import { Statgraph2Component } from './stat/statgraph2/statgraph2.component';
import { GamehistoryComponent } from './stat/gamehistory/gamehistory.component';
import { MpComponent } from './mp/mp.component';
import { MpchatComponent } from './mp/mpchat/mpchat.component';
import { PongComponent } from './pong/pong.component';
import { MyprofilComponent } from './modules/myprofil/myprofil.component';
import { IconeAvatarHistoryComponent } from './modules/icone-avatar-history/icone-avatar-history.component';
import { PongContainerComponent } from './pong-container/pong-container.component';
import { GameChatComponent } from './pong-container/game-chat/game-chat.component';
import { HomegamelistComponent } from './modules/general/home/homegamelist/homegamelist.component';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner'; 
import { CallbackAuthComponent } from './auth/callback-auth/callback-auth.component';
import { BackgroundneonComponent } from './modules/general/backgroundneon/backgroundneon.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import {MatTableModule} from '@angular/material/table';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
	declarations: [
		PongComponent,
		AppComponent,
		RoomComponent,
		AuthComponent,
		HomeComponent,
		LogoutComponent,
		TwoauthenticationComponent,
		Set2faComponent,
		ProfilepageComponent,
		BackdoorComponent,
		ChatComponent,
		CreateroomComponent,
		RoomlistComponent,
		AvatarComponent,
		UploadPicComponent,
		NavbarComponent,
		SetWarnTimerDialog,
		GameInviteDialog,
		tooMuchWindowOpenDialog,
		confirmSwitchInterfaceDialog,
		IconeAvatarComponent,
		IconeAvatarChatComponent,
		ChangeNameComponent,
		ChatselectorComponent,
		StatselectorComponent,
		Statgraph1Component,
		Statgraph2Component,
		GamehistoryComponent,
		MpComponent,
		MpchatComponent,
		MyprofilComponent,
		IconeAvatarHistoryComponent,
		PongContainerComponent,
		GameChatComponent,
		HomegamelistComponent,
		CallbackAuthComponent,
		BackgroundneonComponent,
  LeaderboardComponent

	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		MatIconModule,
		MatButtonModule,
		MatInputModule,
		MatCheckboxModule,
		MatToolbarModule,
		MatListModule,
		MatSnackBarModule,
		MatDialogModule,
		MatMenuModule,
		MatSelectModule,
		MatBadgeModule,
		MatSlideToggleModule,
		MatTabsModule,
		MatProgressSpinnerModule,
		MatTableModule,
		HttpClientModule
	],
	providers: [
	AuthComponent,
	ChatComponent,
	],
	bootstrap: [AppComponent],
	schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
