import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  constructor(public dialog:MatDialog) { 
    
  }
  openDialog() {
    this.dialog.open(Dialog);
  }

  openBadCode() {
    this.dialog.open(BadCodeDialog);
  }

  ngOnInit(): void {
    this.openDialog();
  }

}

@Component({
  selector: 'dialog-dialog',
  templateUrl: 'dialog-dialog.html',
})
export class Dialog {
  constructor() {}
}

@Component({
  selector: 'bad-code-dialog',
  templateUrl: 'bad-code-dialog.html',
})
export class BadCodeDialog {
  constructor() {}
}