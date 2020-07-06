import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {UserService} from '../../../shared/_services/user.service';
import * as moment from 'moment';


@Component({
  selector: 'app-logger',
  templateUrl: './logger.component.html',
  styleUrls: ['./logger.component.scss']
})
export class LoggerComponent implements OnInit, AfterViewInit {

  // dataSource = new MatTableDataSource<Info>(INFO_DATA);
  dataSource;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  //displayedColumns: string[] = ['Username', 'last log', 'fb', 'count fb', 'fbc', 'count fbc', 'fbm', 'count fbm', 'ga', 'count ga', 'ig', 'count ig', 'yt', 'count yt'];
 displayedColumns: string[] = ['Username', 'last log', 'count_dashboard', 'dahsboard'];
  selected = 'option1';

  data = [];
  constructor(private usr: UserService) { }

  ngOnInit() {
  }
  ngAfterViewInit(){
    this.usr.loggerGet().subscribe((data) => {
      if (this.selected === 'option1')
      for (const i in data) {
        const tmp = {
          dash_Custom: moment(data[i]['dash_custom'][data[i]['dash_custom'].length - 1]).format('DD-MMM-YYYY HH:mm:ss').toString(),
          count_custom: data[i]['dash_custom'].length,
          dash_fb: moment(data[i]['dash_fb'][data[i]['dash_fb'].length - 1]).format('DD-MMM-YYYY HH:mm:ss').toString(),
          count_fb: data[i]['dash_fb'].length,
          dash_fbc: moment(data[i]['dash_fbc'][data[i]['dash_fbc'].length - 1]).format('DD-MMM-YYYY HH:mm:ss').toString(),
          count_fbc: data[i]['dash_fbc'].length,
          dash_fbm: moment(data[i]['dash_fbm'][data[i]['dash_fbm'].length - 1]).format('DD-MMM-YYYY HH:mm:ss').toString(),
          count_fbm: data[i]['dash_fbm'].length,
          dash_ga: moment(data[i]['dash_ga'][data[i]['dash_ga'].length - 1]).format('DD-MMM-YYYY HH:mm:ss').toString(),
          count_ga: data[i]['dash_ga'].length,
          dash_ig: moment(data[i]['dash_ig'][data[i]['dash_ig'].length - 1]).format('DD-MMM-YYYY HH:mm:ss').toString(),
          count_ig: data[i]['dash_ig'].length,
          dash_yt: moment(data[i]['dash_yt'][data[i]['dash_yt'].length - 1]).format('DD-MMM-YYYY HH:mm:ss').toString(),
          count_yt: data[i]['dash_yt'].length,
          last_log: moment(data[i]['last_log']).format('DD-MMM-YYYY HH:mm:ss').toString(),
          userid: data[i]['userid'],
          username: data[i]['username']
        };
        console.log(tmp);
        this.data.push(tmp);
      }
      this.dataSource = new MatTableDataSource<Info>(this.data);
      console.log(this.dataSource);
    });

  }



}
export interface Info {
  dash_Custom: string;
  dash_fb: string;
  count_fb: number;
  dash_fbc: string;
  count_fbc: number;
  dash_fbm: string;
  count_fbm: number;
  dash_ga: string;
  count_ga: number;
  dash_ig: string;
  count_ig: number;
  dash_yt: string;
  count_yt: number;
  last_log: string;
  userid: string;
  username: string;
}

