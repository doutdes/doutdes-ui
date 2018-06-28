import {LOGGED, SIGNED_UP} from './actions';
import {IAppState} from './model';

export function rootReducer(state: IAppState, action): IAppState {

  switch (action.type) {

    case LOGGED:
      return Object.assign({}, state, {
        username: action.username,
        logged: true,
        just_signed: false
      });

    case SIGNED_UP:
      return Object.assign({}, state, {
        username: action.username,
        logged: false,
        just_signed: true
      });
  }

  return state;
}
