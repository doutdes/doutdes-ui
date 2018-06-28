import {LOGGED, SIGNED_UP, SLOGGED} from './actions';
import {IAppState, INITIAL_STATE} from './model';

export function rootReducer(state: IAppState, action): IAppState {

  switch (action.type) {

    case LOGGED:
      return Object.assign({}, state, {
        username: action.username,
        logged: true,
        just_signed: false,
        jwt: action.jwt
      });

    case SIGNED_UP:
      return Object.assign({}, state, {
        username: action.username,
        logged: false,
        just_signed: true,
        jwt: ''
      });

    case SLOGGED:
      return Object.assign({}, state, INITIAL_STATE);
  }

  return state;
}
