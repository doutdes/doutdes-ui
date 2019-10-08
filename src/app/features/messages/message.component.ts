import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';
import {Message} from '../../shared/_models/Message';
import {MatTableDataSource} from '@angular/material';
import {MessageService} from '../../shared/_services/message.service';
import {forkJoin, Observable} from 'rxjs';
import * as moment from 'moment';
import {UserMessage} from '../../shared/_models/UserMessage';
import {ToastrService} from 'ngx-toastr';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component({
  selector: 'app-feature-messages',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
})

export class FeatureMessageComponent implements OnInit, OnDestroy {

  modalRef: BsModalRef;
  modalMessage: Message;

  messageList: Array <UserMessage>;
  dataSource: MatTableDataSource<Message>;
  displayedColumns: Array<string> = ['notify', 'createdAt', 'title', 'read'];

  @ViewChild('openMessage') openMessageTemplate: ElementRef;
  @ViewChild('removeMessage') removeMessageTemplate: ElementRef;

  constructor(
    private modalService: BsModalService,
    private breadcrumbActions: BreadcrumbActions,
    private messageService: MessageService,
    private toastr: ToastrService
  ) {
  }

  ngOnInit(): void {
    this.addBreadcrumb();
    this.getMessages();
  }

  openModal(modal: ElementRef, message?: Message) {
    this.modalMessage = message;
    this.modalRef = this.modalService.show(modal,
      {class: 'modal-md modal-dialog-centered',
        backdrop: 'static',
        keyboard: false});
  }

  decline = (): void => {
    this.modalRef.hide();
  };

  getMessages() {
    let observables: Observable<any>[] = [];
    let message, aux: UserMessage;
    this.messageService.getMessageForUser()
      .subscribe(messageList => {
          if (messageList) {
            for (message of messageList) {
              observables.push(this.messageService.getMessageByID(message.message_id));
            }
            forkJoin(observables).subscribe((data: Array<Message>) => {
              data = data.sort((a,b)=> new Date(a.createdAt).getTime() - new Date (b.createdAt).getTime());
              for(let item of data) {
                aux = messageList.find(el => el.message_id === item.id);
                item.is_read = aux.is_read;
              }
              this.dataSource = new MatTableDataSource<Message>(data);
            });
          }
        },
        error => {
          console.log(error);
        });
  }

  setAsRead(message) {
    if (!message.is_read){
    this.messageService.setMessageAsRead(message.id)
      .subscribe(data => {
        this.getMessages();
      }, error => {
        console.log(error);
      });
    }
  }

  deleteMessage(message_id) {
    this.messageService.deleteMessage(message_id)
      .subscribe(data => {
        this.toastr.success('', 'Messaggio eliminato con successo!');
        let newData = this.dataSource.data.filter((message: Message) => message.id !== message_id);
        this.dataSource = new MatTableDataSource<Message>(newData);
        this.decline();
      }, error => {
        this.toastr.error('Si è verificato un errore durante l\'eliminazione del messaggio.', 'Errore');
      });
  }

  formatDate(date): String {
    date = moment(date, null, 'it', true);
    date = date.local().format('DD MMMM YYYY, H:mm');
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
