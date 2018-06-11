import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // users : any = require('../../../routes/users');

  something = 'Cicoria';

  constructor() { }

  ngOnInit() {

  }

}
