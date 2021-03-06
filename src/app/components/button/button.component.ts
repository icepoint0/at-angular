import { AfterContentInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';

export type AtButtonType = 'default' | 'primary' | 'text' | 'success' | 'error' | 'warning' | 'info';
export type AtButtonShape = 'circle' | null ;
export type AtButtonSize = 'small' | 'large' | 'smaller' ;

@Component({
  selector: '[at-button]',
  template: `<i *ngIf="atIcon != null" class="at-btn__icon icon {{atIcon}}"></i>
  <span #text [class.at-btn__text]="showText" [style.display]="showText ? '' : 'none'">
  <ng-content></ng-content>
</span>
  `
})
export class ButtonComponent implements OnInit {

  @Input()
  set atType(type: AtButtonType) {
    this._type = type;
    this._setClassMap();
  }

  get atType(): AtButtonType {
    return this._type;
  }

  @Input()
  set atShape(shape: AtButtonShape) {
    this._shape = shape;
    this._setClassMap();
  }

  get atShape(): AtButtonShape {
    return this._shape;
  }

  @Input()
  set atIcon(icon: string) {
    this._icon = icon;
  }

  get atIcon(): string {
    return this._icon;
  }

  @Input()
  set iconLoading(value: boolean) {
    this._iconLoading = value;
    value === false ? this._icon = null : this._icon = 'at-btn__loading icon-loader';
  }

  get size(): AtButtonSize {
    return this._size;
  }

  @Input()
  set size(value: AtButtonSize) {
    this._size = value;
    this._setClassMap();
  }

  @ViewChild('text', { static: true }) text: ElementRef;

  _type: AtButtonType = 'default';
  _el: HTMLElement;
  _shape: AtButtonShape;
  nativeElement: HTMLElement;
  _prefixCls = 'at-btn';
  _classList = [];
  _iconLoading = false;
  _icon: string;
  _size: AtButtonSize;

  constructor(private _elementRef: ElementRef, private _renderer: Renderer2) {
    this._el = this._elementRef.nativeElement;
    this.nativeElement = this._elementRef.nativeElement;
    this._renderer.addClass(this._el, this._prefixCls);
  }

  ngOnInit(): void {

  }

  _setClassMap(): void {
    this._classList.forEach(_className => {
      this._renderer.removeClass(this._el, _className);
    });

    this._classList = [
      this.atType && `${this._prefixCls}--${this.atType}`,
      this.atShape && `${this._prefixCls}--${this.atShape}`,
      this.size && `${this._prefixCls}--${this.size}`
    ].filter((item) => {
      return !!item;
    });
    this._classList.forEach(_className => {
      this._renderer.addClass(this._el, _className);
    });
  }

  get showText(): boolean {
    if (this.text.nativeElement) {
      return ((this.text.nativeElement.childNodes || []).length > 0 || (this.text.nativeElement.children || []).length > 0);
    } else {
      return false;
    }
  }
}
