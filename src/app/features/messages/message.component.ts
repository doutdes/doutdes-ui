import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';
import {Message} from '../../shared/_models/Message';
import {MatTableDataSource} from '@angular/material';
import {MessageService} from '../../shared/_services/message.service';
import {forkJoin, Observable} from 'rxjs';
import * as moment from 'moment';
import {UserMessage} from '../../shared/_models/UserMessage';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-feature-messages',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],

})

export class FeatureMessageComponent implements OnInit, OnDestroy {

  dataSource: MatTableDataSource<Message>;
  displayedColumns: Array<string> = [ 'createdAt', 'title', 'read', 'delete'];

  constructor(
    private breadcrumbActions: BreadcrumbActions,
    private messageService: MessageService,
    private toastr: ToastrService
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
            observables.push(this.messageService.getMessageByID(message.message_id));
          }
          forkJoin(observables).subscribe(data => {
            this.dataSource = new MatTableDataSource<Message>(data);
          });
        },
        error => {
          console.log(error);
        });
    return observables;
  }

  setAsRead(message_id) {
    this.messageService.setMessageAsRead(message_id)
      .subscribe(data => {
        this.toastr.success('', 'Messaggio letto!');
      }, error => {
      this.toastr.error('Si è verificato un errore.', 'Errore');
    })
  }

  deleteMessage (message_id){

  }

  formatDate (date) : String {
    date = moment(date, null ,'it', true);
    date = date.format('DD MMMM YYYY, H:mm:ss');
    return date.toString();
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
