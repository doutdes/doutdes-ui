import {Component, HostBinding, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-emptycard',
  template: `
      <div class="rounded" style="border:2px dashed #aaa; height:396px"></div>
  `
})

export class EmptycardComponent implements OnInit {
  @Input() lgOrder: string;
  @Input() mdOrder: string;
  @HostBinding('class') elementClass = 'col-md-6 col-lg-4 pt-3'; // TODO add order attributes

  ngOnInit() {
    this.elementClass = this.elementClass + ' order-lg-' + this.lgOrder + ' order-md-' + this.mdOrder;
  }
}
