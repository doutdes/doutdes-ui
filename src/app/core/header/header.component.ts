import {Component, OnInit} from '@angular/core';
import {select} from '@angular-redux/store';
import {Observable} from 'rxjs';
import {LoginState} from '../../features/authentication/login/login.model';
import {User} from '../../shared/_models/User';
import {LoginActions} from '../../features/authentication/login/login.actions';

@Component({
  selector: 'app-core-header',
  templateUrl: './header.component.html'
})

export class HeaderComponent implements OnInit {

  // @select('login') loginState: Observable<LoginState>;
  username$: string = null;

  constructor(private actions: LoginActions ) { }

  ngOnInit(): void {
    /*this.loginState.subscribe(logState => {
      if (logState.user != null) {
        this.username$ = logState.user.username;
      }
    });*/

    this.username$ = localStorage.getItem('username');
  }

  logout() {
    this.actions.logoutUser();
  }

}
