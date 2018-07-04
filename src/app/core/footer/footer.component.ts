import {Component} from '@angular/core';

@Component({
  selector: 'app-core-footer',
  templateUrl: './footer.component.html',
})

export class FooterComponent {
  copyrightYear = new Date().getFullYear();
}
