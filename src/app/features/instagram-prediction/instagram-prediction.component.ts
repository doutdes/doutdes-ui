import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { InstagramPredictionService} from '../../shared/_services/instagram-prediction.service';
import {ToastrService} from 'ngx-toastr';
import {ApiKeysService} from '../../shared/_services/apikeys.service';

@Component({
  selector: 'app-instagram-prediction',
  templateUrl: './instagram-prediction.component.html',
  styleUrls: ['./instagram-prediction.component.scss']
})
export class InstagramPredictionComponent implements OnInit {
  fieldsPrediction: FormGroup;
  username: String;
  date: Date;
  time: number;
  isVideo: boolean;
  isShow = true;
  controlOutput: boolean;
  description: String;
  output;

  constructor(
    private instPredServ: InstagramPredictionService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private apiKeyService: ApiKeysService,
  ) {}

  ngOnInit() {
    this.fieldsPrediction = this.formBuilder.group({
      username:  ['', Validators.compose([Validators.maxLength(20), Validators.required])],
      date: ['', Validators.required],
      time: ['', Validators.required],
      isVideo: ['', Validators.required],
      description:  ['', Validators.compose([Validators.maxLength(30), Validators.required])],
    });
  }
  async onSubmit() {
    this.username = this.fieldsPrediction.value.username;
    this.date = this.fieldsPrediction.value.date;
    this.time = this.fieldsPrediction.value.time;
    this.isVideo = this.fieldsPrediction.value.isVideo;
    this.description = this.fieldsPrediction.value.description;
    const date_aux = new Date(this.date);
    const day = date_aux.getDay();
    const month = date_aux.getMonth();
    let page_id;

    page_id = await this.getPageID();

    if (this.username === '' ||  Number.isNaN(day) || Number.isNaN(month) || this.description === '') {
      this.toastr.error('I campi devono essere tutti compilati, riprovare.');
    } else if (this.time > 23 || this.time < 0) {
      this.toastr.error('Il campo Ora Pubblicazione deve essere un interno compreso tra 0 e 23.');
    } else {
      this.instPredServ.concatenationStrings(this.username, day, month, this.time, this.isVideo, this.description, page_id)
        .subscribe(data => {this.isShow = false;
         if (Object.values(data)[0] > 0.5) {
           this.controlOutput = true;
           this.output = Object.values(data)[0] * 100;
         } else {
           this.controlOutput = false;
           this.output = (1 - Object.values(data)[0]) * 100;
         }
         this.output =  Math.round(this.output);
        });
    }
  }

  async getPageID() {
    let pageID;

    try {
      pageID = (await this.apiKeyService.getAllKeys().toPromise()).ig_page_id;
    } catch (e) {
      console.error('getPageID -> error doing the query', e);
    }

    return pageID;
  }
}



