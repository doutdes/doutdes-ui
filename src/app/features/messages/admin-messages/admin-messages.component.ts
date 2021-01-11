import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {BreadcrumbActions} from '../../../core/breadcrumb/breadcrumb.actions';
import {Breadcrumb} from '../../../core/breadcrumb/Breadcrumb';
import { Message } from '../../../shared/_models/Message';
import { MessageService} from '../../../shared/_services/message.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-admin-messages',
  templateUrl: './admin-messages.component.html',
  styleUrls: ['./admin-messages.component.scss']
})
export class AdminMessagesComponent implements OnInit, OnDestroy {

  writeMessage: FormGroup;
  message: Message;
  constructor(
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private breadcrumbActions: BreadcrumbActions,
  ) {
  }
  ngOnInit(): void {
    this.addBreadcrumb();
    this.writeMessage = this.formBuilder.group({
      title:  ['', Validators.compose([Validators.maxLength(20), Validators.required])],
      body:   ['', Validators.compose([Validators.maxLength(40), Validators.required])]
    }); // oppure [Validators.minLength(10)
    this.message = new class implements Message {
      createdAt: Date;
      id: number;
      is_read: boolean;
      text: string;
      title: string;
      updatedAt: Date;
    };
  }
  onSubmit() {
    this.message.title = this.writeMessage.value.title;
    this.message.text = this.writeMessage.value.body;
    if (this.message.title === '' || this.message.text === '') {
      this.toastr.error('Entrambi i campi devono essere compilati, riprovare.');
    } else {
      this.messageService.createMessage(this.message)
        .subscribe(data => {let message_id = Object.values(data)[3];
            this.messageService.adminMessages(message_id)
              .subscribe(data => {this.toastr.success('Message sent successfully.'); }, ); },
          error => {console.log(error); });
    }
  }
  addBreadcrumb() { // Modifica barra di navigazione.
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));
    bread.push(new Breadcrumb('Scrivi Messaggio', '/messages/'));

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

}
