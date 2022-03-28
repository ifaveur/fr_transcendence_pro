import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { CallbackAuthComponent } from './callback-auth/callback-auth.component';



@NgModule({
  declarations: [
    CallbackAuthComponent
  ],
  imports: [
    CommonModule,
  ],
  exports:[
    AuthService
  ],
  providers:[
    AuthService
  ]
})
export class AuthModule { }
