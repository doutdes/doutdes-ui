import {NgModule} from '@angular/core';
import {NgRedux, NgReduxModule} from '@angular-redux/store';
import {IAppState, INITIAL_STATE} from './model';
import {rootReducer} from './reducers';

@NgModule({
  imports: [NgReduxModule]
})

export class StoreModule {
  constructor(
    public store: NgRedux<IAppState>
  ) {
    store.configureStore(rootReducer, INITIAL_STATE);
  }
}
