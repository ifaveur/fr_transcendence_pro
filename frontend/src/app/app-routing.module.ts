import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { PongComponent } from './pong/pong.component';
import { AuthComponent } from './auth/auth.component';
import { RolesGuard } from './guard_access/access.guard';
import { HomeComponent } from './modules/general/home/home.component';
import { RoomComponent } from './mainchat/room/room.component';
import { AlreadyLoggedGuard } from './guard_access/auth.guard';
import { LogoutComponent } from './auth/logout/logout.component';
import { TwoauthenticationComponent } from './auth/twoauthentication/twoauthentication.component';
import { ProfilepageComponent } from './modules/profilepage/profilepage.component';
import { BackdoorComponent } from './backdoor/backdoor.component';
import { CallbackAuthComponent } from './auth/callback-auth/callback-auth.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';

const routes: Routes = [
  {
    path: 'auth', component: AuthComponent,
    canActivate: [AlreadyLoggedGuard]
  },
  {
    path: '2fa', component : TwoauthenticationComponent,
    canActivate: [AlreadyLoggedGuard]
  },
  {
    path: 'home', component: HomeComponent, 
    canActivate: [RolesGuard]
  },
  {
    path: 'callback', component: CallbackAuthComponent, 
    canActivate: [AlreadyLoggedGuard]
  },
  {
    path: 'leaderboard', component: HomeComponent,
    canActivate: [RolesGuard]
  },
  {
    path: 'chat', component: RoomComponent, 
    canActivate: [RolesGuard]
  },
  {
    path: 'logout', component: LogoutComponent, 
    canActivate: [RolesGuard]
  },
  {
    path: 'myprofil',  component: HomeComponent,
    canActivate: [RolesGuard]
  },
  {
    path: 'profil/:profilID',  component: HomeComponent,
    canActivate: [RolesGuard]
  },
  {
    path :'backdoor', component: BackdoorComponent
  },
  {
    path: 'pong/:gameID', component: HomeComponent,
    canActivate: [RolesGuard]
  },
  {
    path: 'pong/invite/:userID', component: HomeComponent,
    canActivate: [RolesGuard]
  },
  {
    path: 'pong', component: HomeComponent,
    canActivate: [RolesGuard]
  },
  {
    path: '**',
    component: HomeComponent  ,
    canActivate: [RolesGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule],
  providers: [RolesGuard
    , AlreadyLoggedGuard]
})
export class AppRoutingModule { }
