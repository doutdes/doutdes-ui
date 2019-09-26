import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';
import {Message} from '../../shared/_models/Message';
import {MatTableDataSource} from '@angular/material';
import {MessageService} from '../../shared/_services/message.service';
import {map, mergeMap, scan, switchMap} from 'rxjs/operators';
import {UserMessage} from '../../shared/_models/UserMessage';
import {flatMap} from 'tslint/lib/utils';
import {forkJoin, Observable} from 'rxjs';
import {forEach} from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-feature-messages',
  templateUrl: './message.component.html',
})

export class FeatureMessageComponent implements OnInit, OnDestroy {

  dataSource: MatTableDataSource<Message>;
  displayedColumns: Array<string> = ['title', 'text'];

  constructor(
    private breadcrumbActions: BreadcrumbActions,
    private messageService: MessageService
  ) {
  }

  ngOnInit(): void {
    this.addBreadcrumb();
    this.getMessages();
  }

  getMessages() {
    let observables: Observable<any>[] = [];
    let message;
    this.messageService.getMessageForUser()
      .subscribe(messageList => {
          for (message of messageList) {
            observables.push(this.messageService.getMessageByID(message.message_id))
          }
          forkJoin(observables).subscribe(message => console.log (message));
        },
        error => {
          console.log(error);
        });
    return observables;
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Messaggi', '/messages/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }


}
