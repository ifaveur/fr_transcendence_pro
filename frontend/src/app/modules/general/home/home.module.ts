import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoutModule } from 'src/app/auth/logout/logout.module';


@NgModule({
  declarations: [
	  LogoutModule,
  ],
  imports: [
    CommonModule, 
    LogoutModule
  ]
})
export class HomeModule { }
