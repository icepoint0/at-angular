import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Renderer2,
  ViewChild
} from '@angular/core';
import { delay, map } from 'rxjs/operators';
import { AtSelectControlService } from '../../select/at-select-control.service';
import { AtTreeNode } from '../../tree/at-tree-node';

@Component({
  selector: '[at-tree-select-top-control]',
  preserveWhitespaces: false,
  animations: [
    trigger('tagAnimation', [
      state('*', style({opacity: 1, transform: 'scale(1)'})),
      transition('void => *', [
        style({opacity: 0, transform: 'scale(0)'}),
        animate('150ms linear')
      ]),
      state('void', style({opacity: 0, transform: 'scale(0)'})),
      transition('* => void', [
        style({opacity: 1, transform: 'scale(1)'}),
        animate('150ms linear')
      ])
    ])
  ],
  template: `
    <ng-template #inputTemplate>
      <input
        #inputElement
        [ngStyle]="{'display': atShowSearch && atOpen ? 'block' :'none'}" placeholder="{{singleValueLabel}}"
        autocomplete="off"
        class="at-select__input fff"
        (compositionstart)="isComposing = true"
        (compositionend)="isComposing = false"
        (input)="updateWidth()"
        [ngModel]="inputValue"
        (ngModelChange)="setInputValue($event)"
        [disabled]="atDisabled">
    </ng-template>
    <div
      (click)="focusOnInput($event)"
      *ngIf="atPlaceHolder"
      at-select-unselectable
      [style.display]="placeHolderDisplay"
      class="at-select-selection__placeholder">
      {{ atPlaceHolder }}
    </div>
    <!--single mode-->
    <ng-container *ngIf="isSingleMode">
      <!--selected label-->
      <div
        *ngIf="selectedOptions.length"
        class="at-select-selection-selected-value"
        [attr.title]="selectedOptions[0].title"
        [ngStyle]="selectedValueDisplay">
      </div>

      <div class="at-select__selection" (click)="focusOnInput($event)">
        <span class="at-select__selected"
              *ngIf="!atShowSearch || ( atShowSearch && !atOpen)">   {{ selectedOptions[0]?.title
          }}</span>
        <!--show search-->
        <div
          *ngIf="atShowSearch"
          [style.display]="searchDisplay">
          <div class="at-select-search__field__wrap">
            <ng-template [ngTemplateOutlet]="inputTemplate"></ng-template>
            <span class="at-select-search__field__mirror">{{inputValue}}&nbsp;</span>
          </div>
        </div>
        <i class="icon icon-chevron-down at-select__arrow"></i>
        <i *ngIf="allowClear" (click)="clear($event)"
           class="icon icon-x at-select__clear ng-tns-c14-34 ng-star-inserted"
           style="background: white;z-index: 2"></i>
      </div>
    </ng-container>
    <!--multiple or tags mode-->
    <ul (click)="focusOnInput($event)" class="at-select__selection at-select__selection__ul"
        *ngIf="isMultipleOrTags">
      <ng-container *ngFor="let value of selectedOptions">
        <li
          class="at-select__selection__ul__tag"
          *ngIf="isOptionDisplay(value)"
          [@tagAnimation]
          [attr.title]="getPropertyFromValue(value,'title')"
          [class.at-select-selection__choice__disabled]="getPropertyFromValue(value,'disabled')"
        >
          <span>{{ getPropertyFromValue(value, 'title') || value }}</span>
          <i *ngIf="!getPropertyFromValue(value,'atDisabled')" (click)="removeValueFormSelected($event,value)"
             class="icon icon-x at-tag__close"></i>
        </li>
      </ng-container>
      <input type="text"
             #inputElement
             *ngIf="atShowSearch"
             class="at-select-search-inline"
             (input)="updateWidth()"
             [ngModel]="inputValue"
             (ngModelChange)="setInputValue($event)"
             [disabled]="atDisabled"
             placeholder=""/>
      <i class="icon icon-chevron-down at-select__arrow"></i>
      <i *ngIf="allowClear" (click)="clear($event)"
         class="icon icon-x at-select__clear ng-tns-c14-34 ng-star-inserted"
         style="background: white;z-index: 2"></i>
    </ul>
  `,
  host: {
    '[class.at-select-selection__rendered]': 'true'
  }
})
export class AtTreeSelectTopControlComponent implements OnInit {

  constructor(private renderer: Renderer2, private select_control_service: AtSelectControlService) {

  }

  inputValue: string;
  isComposing = false;
  atOpen = false;

  @ViewChild('inputElement', { static: false }) inputElement: ElementRef;

  @Input() multiple;
  @Input() atShowSearch = false;
  @Input() allowClear = false;
  @Input() atPlaceHolder;

  get isSingleMode(): boolean {
    return this.multiple === false;
  }

  @Input()
  atMode = 'common';
  @Input()
  atDisabled = false;

  @Input()
  singleValueLabel;

  focusOnInput($event: Event): void {
    if (($event.target as HTMLElement).classList.contains('icon-x')) {
    } else {
      this.select_control_service.$openStatus.next(true);
    }
  }

  ngOnInit(): void {
    this.subPushOption();
    this.subStatusChange();
    this.subSearch();
  }

  getPropertyFromValue(value: string, key: string): string {
    return value[key] || '';
  }

  get selectedOptions(): AtTreeNode[] {
    return this.options;
  }

  isOptionDisplay(value: any): boolean {
    return !!this.getPropertyFromValue(value, 'title');
  }

  get searchDisplay(): string {
    return this.atOpen ? 'block' : 'none';
  }

  options = [];

  subPushOption(): void {
    this.select_control_service.$optionsChange.asObservable().subscribe(options => {
      this.options = options;
    });
  }

  subSearch(): void {

  }

  subStatusChange(): void {
    this.select_control_service.$openStatus.asObservable().pipe(map((data) => {
      this.atOpen = data;
      return data;
    })).subscribe(data => {
      if (this.inputElement && data === true) {
        this.inputElement.nativeElement.focus();
      }
    });
  }

  get selectedValueDisplay(): { [key: string]: string } {
    let showSelectedValue = false;
    let opacity = 1;
    if (!this.atShowSearch) {
      showSelectedValue = true;
    } else {
      if (this.atOpen) {
        showSelectedValue = !(this.inputValue || this.isComposing);
        if (showSelectedValue) {
          opacity = 0.4;
        }
      } else {
        showSelectedValue = true;
      }
    }
    return {
      display: showSelectedValue ? 'block' : 'none',
      opacity: `${opacity}`
    };
  }

  get isMultipleOrTags(): boolean {
    return this.multiple;
  }

  clear(): void {
    this.select_control_service.removeAllTree();
  }

  removeValueFormSelected($event: Event, value: AtTreeNode): void {
    $event.preventDefault();
    this.select_control_service.removeTreeValue(this.options, value.key);
  }

  get placeHolderDisplay(): string {
    return this.inputValue || this.isComposing || this.selectedOptions.length ? 'none' : 'block';
  }

  setInputValue(value: string): void {
    this.inputValue = value;
    this.updateWidth();
    this.select_control_service.$searchValueChange.next(value);
  }

  updateWidth(): void {
    if (this.isMultipleOrTags && this.inputElement) {
      if (this.inputValue || this.isComposing) {
        this.renderer.setStyle(this.inputElement.nativeElement, 'width', `${this.inputElement.nativeElement.scrollWidth}px`);
      } else {
        this.renderer.removeStyle(this.inputElement.nativeElement, 'width');
      }
    }
  }
}
