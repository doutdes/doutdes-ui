import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Message } from '../../../shared/_models/Message';
import { UserMessage } from '../../../shared/_models/UserMessage';
import { MessageService} from '../../../shared/_services/message.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-messages',
  templateUrl: './admin-messages.component.html',
  styleUrls: ['./admin-messages.component.scss']
})
export class AdminMessagesComponent implements OnInit {

  writeMessage: FormGroup;
  message: Message;
  constructor(
    private messageService: MessageService,
  ) {
  }
  ngOnInit() {
  }
  onSubmit() {
    this.message.title = this.writeMessage.value.title;
    this.message.text = this.writeMessage.value.body;
    this.messageService.createMessage(this.message)
      .subscribe(data => { console.log(data); }, error => {console.log(error); });
  }

}
