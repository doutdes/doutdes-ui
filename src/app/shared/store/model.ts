export interface IAppState {
  username?: String;
  logged: boolean;
  just_signed: boolean;
  jwt: string;
}

export const INITIAL_STATE: IAppState = {
  username: '',
  logged: false,
  just_signed: false,
  jwt: ''
};
