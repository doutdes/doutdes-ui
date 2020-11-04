import { NgModule } from '@angular/core';
import { InstagramPredictionComponent} from './instagram-prediction.component';
import { InstagramPredictionRouting } from './instagram-prediction.routing';
import { SharedModule } from '../../shared/shared.module';
import { CoreModule } from '../../core/core.module';

@NgModule({
  declarations: [
    InstagramPredictionComponent
  ],
  imports: [
    SharedModule,
    CoreModule,
    InstagramPredictionRouting
  ],
  exports: [
    InstagramPredictionComponent
  ]
})
export class InstagramPredictionModule { }
