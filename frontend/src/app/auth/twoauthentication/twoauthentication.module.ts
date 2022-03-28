import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TwoauthenticationComponent } from './twoauthentication.component';
import { FormsModule, NgForm, ReactiveFormsModule } from '@angular/forms';
import { DialogComponent } from './dialog/dialog.component';



@NgModule({
  declarations: [
    TwoauthenticationComponent,
    DialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class TwoauthenticationModule { }
