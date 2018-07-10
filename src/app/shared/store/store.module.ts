import {NgModule} from '@angular/core';
import {NgRedux, NgReduxModule} from '@angular-redux/store';
import {FIRST_STATE, IAppState} from './model';
import {rootReducer} from './root';

@NgModule({
  imports: [NgReduxModule]
})

export class StoreModule {
  constructor (private ngRedux: NgRedux<IAppState>) {
    ngRedux.configureStore(rootReducer, FIRST_STATE);
  }
}
