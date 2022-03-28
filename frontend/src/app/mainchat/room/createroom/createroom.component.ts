import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { ICreateChat } from 'src/app/interfaces/chat.interface';
import { socketType } from 'src/app/modules/general/home/home.component';


@Component({
  selector: 'app-createroom',
  templateUrl: './createroom.component.html',
  styleUrls: ['./createroom.component.scss']
})
export class CreateroomComponent implements OnInit {

  @Input() public socket!: socketType;
  @Input() public iduser: number = 0;

  @Output() closePopup = new EventEmitter();

  
  form: FormGroup = new FormGroup({
    name: new FormControl("",[Validators.required, Validators.minLength(1)]),
    isprivate: new FormControl(false),
    islocked: new FormControl(false),
    password: new FormControl("")
  })

  constructor() { }

  ngOnInit(): void {
    
  }


  public close() {
    this.closePopup.emit("");
  }

  public setPrivate() {
    const passwordfield = this.form.get('password')
    const lockedcheckbox = this.form.get('islocked')
    if (this.form.value.isprivate) {
      passwordfield?.clearValidators();
      passwordfield?.reset();
      lockedcheckbox?.reset();
      lockedcheckbox?.disable();
    }
    else {
      lockedcheckbox?.enable();
    }
  }


  public setLocked() {
    const passwordfield = this.form.get('password')
    if (this.form.value.islocked)
      passwordfield?.setValidators(Validators.required);
    else {
      passwordfield?.clearValidators();
      passwordfield?.reset();
    }
  }

  public onSubmit() {
    if (this.form.valid) {
      const result: ICreateChat  = {
        name: this.form.value.name,
        isprivate: this.form.value.isprivate,
        islocked: this.form.value.islocked ? this.form.value.islocked : false,
        password: this.form.value.password 
      }

		  this.socket.emit('createRoom', result);
      this.close();
    }
  }

}
