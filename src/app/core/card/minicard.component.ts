import {Component, HostBinding, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-minicard',
  templateUrl: './minicard.component.html',
})

export class MiniCardComponent implements OnInit {

  @HostBinding('class') elementClass = 'col-md-3 col-sm-3 col-6';
  @Input() padding: string;

  ngOnInit(): void {
    this.elementClass += ' ' + this.padding;
  }

}
