import {NgModule} from '@angular/core';
import {FooterComponent} from './footer/footer.component';
import {HeaderComponent} from './header/header.component';
import {AppFooterModule, AppHeaderModule} from '@coreui/angular';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    AppFooterModule,
    AppHeaderModule,
  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ]
})

export class CoreModule { }
