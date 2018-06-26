import { AbstractControl } from '@angular/forms';
import * as CodiceFiscale from 'codice-fiscale-js';

export class FiscalCodeValidation {

  static CheckFiscalCode(AC: AbstractControl) {
    const fiscal_code = AC.get('fiscal_code').value; // to get value in input tag

    if (!CodiceFiscale.check(fiscal_code)) {
      AC.get('fiscal_code').setErrors( {InvalidFiscalCode: true} );
    } else {
      return null;
    }
  }
}
