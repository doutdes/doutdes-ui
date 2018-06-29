import {Component, Input, OnInit} from '@angular/core';
import { navItems } from './../../_nav';
import {NgRedux, select} from '@angular-redux/store';
import {IAppState} from '../../shared/store/model';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnInit{
  @select() username$: Observable<string>;

  public navItems = navItems;
  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement = document.body;
  public username: string;

  constructor(
    ngRedux: NgRedux<IAppState>
  ) {

    this.changes = new MutationObserver((mutations) => {
      this.sidebarMinimized = document.body.classList.contains('sidebar-minimized');
    });

    this.changes.observe(<Element>this.element, {
      attributes: true
    });
    console.log(this.username);
  }

  ngOnInit() {
    this.username$.subscribe(username => this.username = username);
  }
}
