import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ColComponent } from '../../grid/col/col.component';

@Component({
  selector: 'at-form-control',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="at-form-item__content">
      <ng-content></ng-content>
    </div>
  `
})
export class AtFormControlComponent extends ColComponent implements OnInit {

  ngOnInit(): void {
  }

}
