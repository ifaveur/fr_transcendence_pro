import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { throws } from 'assert';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';

  constructor(private router: Router) {}
  ngOnInit(): void {
	}
}
