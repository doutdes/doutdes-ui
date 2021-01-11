import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FeatureMessageComponent} from './message.component';
import {AdminMessagesComponent} from './admin-messages/admin-messages.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: FeatureMessageComponent
      },
      {
        path: 'admin-messages',
        component: AdminMessagesComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class FeatureMessageRoutingModule {
}
