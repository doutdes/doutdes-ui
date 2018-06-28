export interface IAppState {
  username?: String;
  logged: boolean;
  just_signed: boolean;
}

export const INITIAL_STATE: IAppState = {
  username: '',
  logged: false,
  just_signed: false
};
