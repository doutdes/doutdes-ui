import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { InstagramPredictionService} from '../../shared/_services/instagram-prediction.service';
import {ToastrService} from 'ngx-toastr';

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
  onSubmit() {
    this.username = this.fieldsPrediction.value.username;
    this.date = this.fieldsPrediction.value.date;
    this.time = this.fieldsPrediction.value.time;
    this.isVideo = this.fieldsPrediction.value.isVideo;
    this.description = this.fieldsPrediction.value.description;
    const date_aux = new Date(this.date);
    const day = date_aux.getDay();
    const month = date_aux.getMonth();

    if (this.username === '' ||  Number.isNaN(day) || Number.isNaN(month) || this.description === '') {
      this.toastr.error('I campi devono essere tutti compilati, riprovare.');
    } else if (this.time > 23 || this.time < 0) {
      this.toastr.error('Il campo Ora Pubblicazione deve essere un interno compreso tra 0 e 23.');
    } else {
      this.instPredServ.concatenationStrings(this.username, day, month, this.time, this.isVideo, this.description)
        .subscribe(data => {this.isShow = false;
         if (data > 0.5) {
           this.controlOutput = true;
           this.output = Object.values(data)[0] * 100;
         } else {
           this.controlOutput = false;
           this.output = (1 - Object.values(data)[0]) * 100;
         }
        });
    }
  }
}



