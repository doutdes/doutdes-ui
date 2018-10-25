/* Filter Actions */

import {Injectable} from '@angular/core';
import {NgRedux} from '@angular-redux/store';
import {IAppState} from '../../../shared/store/model';
import {IntervalDate} from './filter.model';

export const FILTER_INIT    = 'FILTER_INIT';
export const FILTER_RESET   = 'FILTER_RESET';
export const FILTER_BY_DATA = 'FILTER_BY_DATA';

@Injectable()
export class FilterActions {
  constructor(private ngRedux: NgRedux<IAppState>) {}

  initData(originalData, dateInterval: IntervalDate) {
    console.log('Ho ricevuto: ');
    console.log(dateInterval);
    this.ngRedux.dispatch({type: FILTER_INIT, originalData: originalData, originalInterval: dateInterval});
  }

  filterData() {

  }


}
