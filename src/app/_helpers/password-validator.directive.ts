import {AbstractControl} from '@angular/forms';
export class PasswordValidation {

  static MatchPassword(AC: AbstractControl) {
    const password = AC.get('password').value; // to get value in input tag
    const confirmPassword = AC.get('r_password').value; // to get value in input tag

    if (password !== confirmPassword) {
      AC.get('r_password').setErrors( {MatchPassword: true} );
    } else {
      return null;
    }
  }
}
