import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StoreService} from './store.service';

@Injectable()

export class DashboardService {
  constructor(
    private http: HttpClient,
    private storeService: StoreService
  ) {
  }



}
