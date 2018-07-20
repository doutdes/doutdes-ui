import {Component, HostBinding, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-emptycard',
  template: `
      <div class="rounded" style="border:2px dashed #aaa; height:396px"></div>
  `
})

export class EmptycardComponent implements OnInit {
  @Input() xlOrder: string;
  @Input() lgOrder: string;
  @HostBinding('class') elementClass = 'col-lg-6 col-xl-4 pt-3'; // TODO add order attributes

  ngOnInit() {
    this.elementClass = this.elementClass + ' order-xl-' + this.xlOrder + ' order-lg-' + this.lgOrder;
  }
}
