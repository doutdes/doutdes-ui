import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {InstagramPredictionComponent} from './instagram-prediction.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: InstagramPredictionComponent
      }
    ])
  ],
  exports: [RouterModule]
})
export class InstagramPredictionRouting {}
