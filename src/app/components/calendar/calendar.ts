import {NgModule,Component,ElementRef,AfterViewInit,AfterViewChecked,OnDestroy,OnInit,Input,Output,SimpleChange,EventEmitter,forwardRef,Renderer2,
        ViewChild,ChangeDetectorRef,TemplateRef,ContentChildren,QueryList} from '@angular/core';
import {trigger,state,style,transition,animate} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {ButtonModule} from '../button/button';
import {DomHandler} from '../dom/domhandler';
import {SharedModule,PrimeTemplate} from '../common/shared';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/forms';

export const CALENDAR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => Calendar),
  multi: true
};

export interface LocaleSettings {
    firstDayOfWeek?: number;
    dayNames: string[];
    dayNamesShort: string[];
    dayNamesMin: string[];
    monthNames: string[];
    monthNamesShort: string[];
    today: string,
    clear: string
}

@Component({
    selector: 'p-calendar',
    template:  `
        <span [ngClass]="{'ui-calendar':true,'ui-calendar-w-btn':showIcon}" [ngStyle]="style" [class]="styleClass">
            <ng-template [ngIf]="!inline">
                <input #inputfield type="text" [attr.id]="inputId" [attr.name]="name" [attr.required]="required" [value]="inputFieldValue" (focus)="onInputFocus($event)" (keydown)="onInputKeydown($event)" (click)="datepickerClick=true" (blur)="onInputBlur($event)"
                    [readonly]="readonlyInput" (input)="onUserInput($event)" [ngStyle]="inputStyle" [class]="inputStyleClass" [placeholder]="placeholder||''" [disabled]="disabled" [attr.tabindex]="tabindex"
                    [ngClass]="'ui-inputtext ui-widget ui-state-default ui-corner-all'"
                    ><button type="button" [icon]="icon" pButton *ngIf="showIcon" (click)="onButtonClick($event,inputfield)" class="ui-datepicker-trigger ui-calendar-button"
                    [ngClass]="{'ui-state-disabled':disabled}" [disabled]="disabled" tabindex="-1"></button>
            </ng-template>
            <div #datepicker class="ui-datepicker ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" [ngClass]="{'ui-datepicker-inline':inline,'ui-shadow':!inline,'ui-state-disabled':disabled,'ui-datepicker-timeonly':timeOnly}" 
                [ngStyle]="{'display': inline ? 'inline-block' : (overlayVisible ? 'block' : 'none')}" (click)="onDatePickerClick($event)" [@overlayState]="inline ? 'visible' : (overlayVisible ? 'visible' : 'hidden')">

                <div class="ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all" *ngIf="!timeOnly && (overlayVisible || inline)">
                    <ng-content select="p-header"></ng-content>
                    <a class="ui-datepicker-prev ui-corner-all" href="#" (click)="prevMonth($event)">
                        <span class="fa fa-angle-left"></span>
                    </a>
                    <a class="ui-datepicker-next ui-corner-all" href="#" (click)="nextMonth($event)">
                        <span class="fa fa-angle-right"></span>
                    </a>
                    <div class="ui-datepicker-title">
                        <span class="ui-datepicker-month" *ngIf="!monthNavigator">{{locale.monthNames[currentMonth]}}</span>
                        <select class="ui-datepicker-month" *ngIf="monthNavigator" (change)="onMonthDropdownChange($event.target.value)">
                            <option [value]="i" *ngFor="let month of locale.monthNames;let i = index" [selected]="i == currentMonth">{{month}}</option>
                        </select>
                        <select class="ui-datepicker-year" *ngIf="yearNavigator" (change)="onYearDropdownChange($event.target.value)">
                            <option [value]="year" *ngFor="let year of yearOptions" [selected]="year == currentYear">{{year}}</option>
                        </select>
                        <span class="ui-datepicker-year" *ngIf="!yearNavigator">{{currentYear}}</span>
                    </div>
                </div>
                <table class="ui-datepicker-calendar" *ngIf="!timeOnly && (overlayVisible || inline)">
                    <thead>
                        <tr>
                            <th scope="col" *ngFor="let weekDay of weekDays;let begin = first; let end = last">
                                <span>{{weekDay}}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let week of dates">
                            <td *ngFor="let date of week" [ngClass]="{'ui-datepicker-other-month ui-state-disabled':date.otherMonth,
                                'ui-datepicker-current-day':isSelected(date),'ui-datepicker-today':date.today}">
                                <a class="ui-state-default" href="#" *ngIf="date.otherMonth ? showOtherMonths : true" 
                                    [ngClass]="{'ui-state-active':isSelected(date), 'ui-state-highlight':date.today, 'ui-state-disabled':!date.selectable}"
                                    (click)="onDateSelect($event,date)">
                                    <ng-container *ngIf="!dateTemplate">{{date.day}}</ng-container>
                                    <ng-template [pTemplateWrapper]="dateTemplate" [item]="date" *ngIf="dateTemplate"></ng-template>
                                </a>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="ui-timepicker ui-widget-header ui-corner-all" *ngIf="showTime||timeOnly">
                    <div class="ui-hour-picker">
                        <a href="#" (click)="incrementHour($event)">
                            <span class="fa fa-angle-up"></span>
                        </a>
                        <span [ngStyle]="{'display': currentHour < 10 ? 'inline': 'none'}">0</span><span>{{currentHour}}</span>
                        <a href="#" (click)="decrementHour($event)">
                            <span class="fa fa-angle-down"></span>
                        </a>
                    </div>
                    <div class="ui-separator">
                        <a href="#">
                            <span class="fa fa-angle-up"></span>
                        </a>
                        <span>:</span>
                        <a href="#">
                            <span class="fa fa-angle-down"></span>
                        </a>
                    </div>
                    <div class="ui-minute-picker">
                        <a href="#" (click)="incrementMinute($event)">
                            <span class="fa fa-angle-up"></span>
                        </a>
                        <span [ngStyle]="{'display': currentMinute < 10 ? 'inline': 'none'}">0</span><span>{{currentMinute}}</span>
                        <a href="#" (click)="decrementMinute($event)">
                            <span class="fa fa-angle-down"></span>
                        </a>
                    </div>
                    <div class="ui-separator" *ngIf="showSeconds">
                        <a href="#">
                            <span class="fa fa-angle-up"></span>
                        </a>
                        <span>:</span>
                        <a href="#">
                            <span class="fa fa-angle-down"></span>
                        </a>
                    </div>
                    <div class="ui-second-picker" *ngIf="showSeconds">
                        <a href="#" (click)="incrementSecond($event)">
                            <span class="fa fa-angle-up"></span>
                        </a>
                        <span [ngStyle]="{'display': currentSecond < 10 ? 'inline': 'none'}">0</span><span>{{currentSecond}}</span>
                        <a href="#" (click)="decrementSecond($event)">
                            <span class="fa fa-angle-down"></span>
                        </a>
                    </div>
                    <div class="ui-ampm-picker" *ngIf="hourFormat=='12'">
                        <a href="#" (click)="toggleAMPM($event)">
                            <span class="fa fa-angle-up"></span>
                        </a>
                        <span>{{pm ? 'PM' : 'AM'}}</span>
                        <a href="#" (click)="toggleAMPM($event)">
                            <span class="fa fa-angle-down"></span>
                        </a>
                    </div>
                </div>
                <div class="ui-datepicker-buttonbar ui-widget-header" *ngIf="showButtonBar">
                    <div class="ui-g">
                        <div class="ui-g-6">
                            <button type="button" [label]="_locale.today" (click)="onTodayButtonClick($event)" pButton [ngClass]="[todayButtonStyleClass]"></button>
                        </div>
                        <div class="ui-g-6">
                            <button type="button" [label]="_locale.clear" (click)="onClearButtonClick($event)" pButton [ngClass]="[clearButtonStyleClass]"></button>
                        </div>
                    </div>
                </div>
                <ng-content select="p-footer"></ng-content>
            </div>
        </span>
    `,
    animations: [
        trigger('overlayState', [
            state('hidden', style({
                opacity: 0
            })),
            state('visible', style({
                opacity: 1
            })),
            transition('visible => hidden', animate('400ms ease-in')),
            transition('hidden => visible', animate('400ms ease-out'))
        ])
    ],
    host: {
        '[class.ui-inputwrapper-filled]': 'filled',
        '[class.ui-inputwrapper-focus]': 'focus'
    },
    providers: [DomHandler,CALENDAR_VALUE_ACCESSOR]
})
export class Calendar implements AfterViewInit,AfterViewChecked,OnInit,OnDestroy,ControlValueAccessor {
    
    @Input() defaultDate: Date;
    
    @Input() style: string;
    
    @Input() styleClass: string;
    
    @Input() inputStyle: string;

    @Input() inputId: string;
    
    @Input() name: string;
    
    @Input() inputStyleClass: string;
    
    @Input() placeholder: string;
    
    @Input() disabled: any;
    
    @Input() dateFormat: string = 'mm/dd/yy';
        
    @Input() inline: boolean = false;
    
    @Input() showOtherMonths: boolean = true;

    @Input() selectOtherMonths: boolean;
    
    @Input() showIcon: boolean;
    
    @Input() icon: string = 'fa-calendar';
    
    @Input() appendTo: any;
    
    @Input() readonlyInput: boolean;
    
    @Input() shortYearCutoff: any = '+10';
    
    @Input() monthNavigator: boolean;

    @Input() yearNavigator: boolean;

    @Input() yearRange: string;
    
    @Input() hourFormat: string = '24';
    
    @Input() timeOnly: boolean;
    
    @Input() stepHour: number = 1;
    
    @Input() stepMinute: number = 1;
    
    @Input() stepSecond: number = 1;
    
    @Input() showSeconds: boolean = false;

    @Input() required: boolean;

    @Input() showOnFocus: boolean = true;
    
    @Input() dataType: string = 'date';
        
    @Input() utc: boolean;
    
    @Input() selectionMode: string = 'single';
    
    @Input() maxDateCount: number;
    
    @Input() showButtonBar: boolean;
    
    @Input() todayButtonStyleClass: string = 'ui-button-secondary';
    
    @Input() clearButtonStyleClass: string = 'ui-button-secondary';
    
    @Input() autoZIndex: boolean = true;
    
    @Input() baseZIndex: number = 0;
        
    @Output() onFocus: EventEmitter<any> = new EventEmitter();
    
    @Output() onBlur: EventEmitter<any> = new EventEmitter();
    
    @Output() onClose: EventEmitter<any> = new EventEmitter();
    
    @Output() onSelect: EventEmitter<any> = new EventEmitter();
    
    @Output() onInput: EventEmitter<any> = new EventEmitter();
    
    @Output() onTodayClick: EventEmitter<any> = new EventEmitter();
    
    @Output() onClearClick: EventEmitter<any> = new EventEmitter();
     
    @Output() onMonthChange: EventEmitter<any> = new EventEmitter();
    
    @ContentChildren(PrimeTemplate) templates: QueryList<any>;
    
    _locale: LocaleSettings = {
        firstDayOfWeek: 0,
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        dayNamesShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        dayNamesMin: ["Su","Mo","Tu","We","Th","Fr","Sa"],
        monthNames: [ "January","February","March","April","May","June","July","August","September","October","November","December" ],
        monthNamesShort: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun","Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
        today: 'Today',
        clear: 'Clear'
    };
    
    @Input() tabindex: number;
    
    @ViewChild('datepicker') overlayViewChild: ElementRef;
    
    @ViewChild('inputfield') inputfieldViewChild: ElementRef;
    
    value: any;
    
    dates: any[];
    
    weekDays: string[];
    
    currentMonthText: string;
    
    currentMonth: number;
    
    currentYear: number;
    
    currentHour: number;
    
    currentMinute: number;
    
    currentSecond: number;
    
    pm: boolean;
    
    overlay: HTMLDivElement;
    
    overlayVisible: boolean;
    
    overlayShown: boolean;
        
    datepickerClick: boolean;
        
    onModelChange: Function = () => {};
    
    onModelTouched: Function = () => {};
    
    calendarElement: any;
    
    documentClickListener: any;
    
    ticksTo1970: number;
    
    yearOptions: number[];
    
    focus: boolean;
    
    isKeydown: boolean;
    
    filled: boolean;

    inputFieldValue: string = null;
    
    _minDate: Date;
    
    _maxDate: Date;
    
    _showTime: boolean;
    
    preventDocumentListener: boolean;
    
    dateTemplate: TemplateRef<any>;
    
    _disabledDates: Array<Date>;
    
    _disabledDays: Array<number>;

    @Input() get minDate(): Date {
        return this._minDate;
    }
    
    set minDate(date: Date) {
        this._minDate = date;
        if(this.currentMonth && this.currentYear) {
            this.createMonth(this.currentMonth, this.currentYear);
        }
    }
    
    @Input() get maxDate(): Date {
        return this._maxDate;
    }
    
    set maxDate(date: Date) {
        this._maxDate = date;
        if(this.currentMonth && this.currentYear) {
            this.createMonth(this.currentMonth, this.currentYear);
        }
    }
    
    @Input() get disabledDates(): Date[] {
        return this._disabledDates;
    }
    
    set disabledDates(disabledDates: Date[]) {
        this._disabledDates = disabledDates;
        if(this.currentMonth && this.currentYear) {
            this.createMonth(this.currentMonth, this.currentYear);
        }
    }
    
    @Input() get disabledDays(): number[] {
        return this._disabledDays;
    }
    
    set disabledDays(disabledDays: number[]) {
        this._disabledDays = disabledDays;
        if(this.currentMonth && this.currentYear) {
            this.createMonth(this.currentMonth, this.currentYear);
        }
    }
    
    @Input() get showTime(): boolean {
        return this._showTime;
    }
    
    set showTime(showTime: boolean) {
        this._showTime = showTime;
        
        if(this.currentHour === undefined) {
            this.initTime(this.value||new Date());
        }
    }
        
    get locale() {
       return this._locale;
    }

    @Input()
    set locale(newLocale: LocaleSettings) {
       this._locale = newLocale;
       this.createWeekDays();
       this.createMonth(this.currentMonth, this.currentYear);
    }

    constructor(public el: ElementRef, public domHandler: DomHandler, public renderer: Renderer2, public cd: ChangeDetectorRef) {}

    ngOnInit() {
        let date = this.defaultDate||new Date();        
        this.createWeekDays();
                
        this.currentMonth = date.getMonth();
        this.currentYear = date.getFullYear();
        this.initTime(date);

        this.createMonth(this.currentMonth, this.currentYear);
        
        this.ticksTo1970 = (((1970 - 1) * 365 + Math.floor(1970 / 4) - Math.floor(1970 / 100) +
            Math.floor(1970 / 400)) * 24 * 60 * 60 * 10000000);
            
        if(this.yearNavigator && this.yearRange) {
            this.yearOptions = [];
            let years = this.yearRange.split(':'),
            yearStart = parseInt(years[0]),
            yearEnd = parseInt(years[1]);
            
            for(let i = yearStart; i <= yearEnd; i++) {
                this.yearOptions.push(i);
            }
        }
    }
    
    ngAfterViewInit() {
        if(!this.inline && this.appendTo) {
            if(this.appendTo === 'body')
                document.body.appendChild(this.overlayViewChild.nativeElement);
            else
                this.domHandler.appendChild(this.overlayViewChild.nativeElement, this.appendTo);
        }
    }
    
    ngAfterViewChecked() {
        if(this.overlayShown) {
            this.alignOverlay();
            this.overlayShown = false;
        }
    }
    
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch(item.getType()) {
                case 'date':
                    this.dateTemplate = item.template;
                break;
                
                default:
                    this.dateTemplate = item.template;
                break;
            }
        });
    }
    
    createWeekDays() {
        this.weekDays = [];
        let dayIndex = this.locale.firstDayOfWeek;
        for(let i = 0; i < 7; i++) {
            this.weekDays.push(this.locale.dayNamesMin[dayIndex]);
            dayIndex = (dayIndex == 6) ? 0 : ++dayIndex;
        }
    }
    
    createMonth(month: number, year: number) {
        this.dates = [];
        this.currentMonth = month;
        this.currentYear = year;
        this.currentMonthText = this.locale.monthNames[month];
        let firstDay = this.getFirstDayOfMonthIndex(month, year);
        let daysLength = this.getDaysCountInMonth(month, year);
        let prevMonthDaysLength = this.getDaysCountInPrevMonth(month, year);
        let sundayIndex = this.getSundayIndex();
        let dayNo = 1;
        let today = new Date();
                
        for(let i = 0; i < 6; i++) {
            let week = [];
            
            if(i == 0) {
                for(let j = (prevMonthDaysLength - firstDay + 1); j <= prevMonthDaysLength; j++) {
                    let prev = this.getPreviousMonthAndYear(month, year);
                    week.push({day: j, month: prev.month, year: prev.year, otherMonth: true, 
                            today: this.isToday(today, j, prev.month, prev.year), selectable: this.isSelectable(j, prev.month, prev.year)});
                }
                
                let remainingDaysLength = 7 - week.length;
                for(let j = 0; j < remainingDaysLength; j++) {
                    week.push({day: dayNo, month: month, year: year, today: this.isToday(today, dayNo, month, year), 
                            selectable: this.isSelectable(dayNo, month, year)});
                    dayNo++;
                }
            }
            else {
                for (let j = 0; j < 7; j++) {
                    if(dayNo > daysLength) {
                        let next = this.getNextMonthAndYear(month, year);
                        week.push({day: dayNo - daysLength, month: next.month, year: next.year, otherMonth:true,
                                    today: this.isToday(today, dayNo - daysLength, next.month, next.year),
                                    selectable: this.isSelectable((dayNo - daysLength), next.month, next.year)});
                    }
                    else {
                        week.push({day: dayNo, month: month, year: year, today: this.isToday(today, dayNo, month, year),
                            selectable: this.isSelectable(dayNo, month, year)});
                    }
                    
                    dayNo++;
                }
            }
            
            this.dates.push(week);
        }
    }
    
    initTime(date: Date) {
        this.pm = date.getHours() > 11;
        if(this.showTime) {
            this.currentMinute = date.getMinutes();
            this.currentSecond = date.getSeconds();
            
            if(this.hourFormat == '12')
                this.currentHour = date.getHours() == 0 ? 12 : date.getHours() % 12;
            else
                this.currentHour = date.getHours();
        }
        else if(this.timeOnly) {
            this.currentMinute = 0;
            this.currentHour = 0;
            this.currentSecond = 0;
        }
    }
    
    prevMonth(event) {
        if(this.disabled) {
            event.preventDefault();
            return;
        }
        
        if(this.currentMonth === 0) {
            this.currentMonth = 11;
            this.currentYear--;
            
            if(this.yearNavigator && this.currentYear < this.yearOptions[0]) {
                this.currentYear = this.yearOptions[this.yearOptions.length - 1];
            }
        }
        else {
            this.currentMonth--;
        }
        
        this.onMonthChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
        this.createMonth(this.currentMonth, this.currentYear);
        event.preventDefault();
    }
    
    nextMonth(event) {
        if(this.disabled) {
            event.preventDefault();
            return;
        }

        if(this.currentMonth === 11) {
            this.currentMonth = 0;
            this.currentYear++;
            
            if(this.yearNavigator && this.currentYear > this.yearOptions[this.yearOptions.length - 1]) {
                this.currentYear = this.yearOptions[0];
            }
        }
        else {
            this.currentMonth++;
        }
        
        this.onMonthChange.emit({ month: this.currentMonth + 1, year: this.currentYear });
        this.createMonth(this.currentMonth, this.currentYear);
        event.preventDefault();
    }
    
    onDateSelect(event, dateMeta) {
        if(this.disabled || !dateMeta.selectable) {
            event.preventDefault();
            return;
        }
                
        if(this.isMultipleSelection() && this.isSelected(dateMeta)) {
            this.value = this.value.filter((date, i) => {
                return !this.isDateEquals(date, dateMeta);
            });
        }
        else {
            if(this.shouldSelectDate(dateMeta)) {
                if(dateMeta.otherMonth) {
                    if(this.selectOtherMonths) {
                        this.currentMonth = dateMeta.month;
                        this.currentYear = dateMeta.year;
                        this.createMonth(this.currentMonth, this.currentYear);
                        this.selectDate(dateMeta);
                    }
                }
                else {
                     this.selectDate(dateMeta);
                }
            }
        }
        
        if(!this.showTime && this.isSingleSelection()) {
            this.overlayVisible = false;
        }

        this.updateInputfield();
        event.preventDefault();
    }
    
    shouldSelectDate(dateMeta) {
        if(this.isMultipleSelection())
            return !this.maxDateCount || !this.value || this.maxDateCount > this.value.length;
        else
            return true;
    }
    
    updateInputfield() {
        let formattedValue = '';

        if(this.value) {
            if(this.isSingleSelection()) {
                formattedValue = this.formatDateTime(this.value);
            }
            else if(this.isMultipleSelection()) {
                for(let i = 0; i < this.value.length; i++) {
                    let dateAsString = this.formatDateTime(this.value[i]);
                    formattedValue += dateAsString;
                    if(i !== (this.value.length - 1)) {
                        formattedValue += ', ';
                    }
                }
            }
            else if(this.isRangeSelection()) {
                if(this.value && this.value.length) {
                    let startDate = this.value[0];
                    let endDate = this.value[1];
                    
                    formattedValue = this.formatDateTime(startDate);
                    if(endDate) {
                        formattedValue += ' - ' + this.formatDateTime(endDate);
                    }
                }
            }
        }

        this.inputFieldValue = formattedValue;
        this.updateFilledState();
        if(this.inputfieldViewChild && this.inputfieldViewChild.nativeElement) {
            this.inputfieldViewChild.nativeElement.value = this.inputFieldValue;
        }
    }
    
    formatDateTime(date) {
        let formattedValue = null;
        if(date) {
            if(this.timeOnly) {
                formattedValue = this.formatTime(date);
            }
            else {
                formattedValue = this.formatDate(date, this.dateFormat);
                if(this.showTime) {
                    formattedValue += ' ' + this.formatTime(date);
                }
            }
        }
        
        return formattedValue;
    }
    
    selectDate(dateMeta) {
        let date;
        if(this.utc)
            date = new Date(Date.UTC(dateMeta.year, dateMeta.month, dateMeta.day));
        else
            date = new Date(dateMeta.year, dateMeta.month, dateMeta.day);
        
        if(this.showTime) {
            if(this.hourFormat === '12' && this.pm && this.currentHour != 12)
                date.setHours(this.currentHour + 12);
            else
                date.setHours(this.currentHour);

            date.setMinutes(this.currentMinute);
            date.setSeconds(this.currentSecond);
        }
        
        if(this.minDate && this.minDate > date) {
            date = this.minDate;
        }
        
        if(this.maxDate && this.maxDate < date) {
            date = this.maxDate;
        }
                
        if(this.isSingleSelection()) {
            this.updateModel(date);
        }
        else if(this.isMultipleSelection()) {
            this.updateModel(this.value ? [...this.value, date] : [date]);
        }
        else if(this.isRangeSelection()) {
            if(this.value && this.value.length) {
                let startDate = this.value[0];
                let endDate = this.value[1];
                
                if(!endDate && date.getTime() >= startDate.getTime()) {
                    endDate = date;
                }
                else {
                    startDate = date;
                    endDate = null;
                }
                
                this.updateModel([startDate, endDate]); 
            }
            else {
                this.updateModel([date, null]); 
            }
        }
            
        this.onSelect.emit(date);
    }
    
    updateModel(value) {
        this.value = value;
        
        if(this.dataType == 'date')
            this.onModelChange(this.value);
        else if(this.dataType == 'string')
            this.onModelChange(this.formatDateTime(this.value));
    }
    
    getFirstDayOfMonthIndex(month: number, year: number) {
        let day = new Date();
        day.setDate(1);
        day.setMonth(month);
        day.setFullYear(year);
        
        let dayIndex = day.getDay() + this.getSundayIndex();
        return dayIndex >= 7 ? dayIndex - 7 : dayIndex;
    }
    
    getDaysCountInMonth(month: number, year: number) {
        return 32 - this.daylightSavingAdjust(new Date(year, month, 32)).getDate();
    }
    
    getDaysCountInPrevMonth(month: number, year: number) {
        let prev = this.getPreviousMonthAndYear(month, year);
        return this.getDaysCountInMonth(prev.month, prev.year);
    }
    
    getPreviousMonthAndYear(month: number, year: number) {
        let m, y;
        
        if(month === 0) {
            m = 11;
            y = year - 1;
        }
        else {
            m = month - 1;
            y = year;
        }
        
        return {'month':m,'year':y};
    }
    
    getNextMonthAndYear(month: number, year: number) {
        let m, y;
        
        if(month === 11) {
            m = 0;
            y = year + 1;
        }
        else {
            m = month + 1;
            y = year;
        }
        
        return {'month':m,'year':y};
    }
    
    getSundayIndex() {
        return this.locale.firstDayOfWeek > 0 ? 7 - this.locale.firstDayOfWeek : 0;
    }
    
    isSelected(dateMeta): boolean {     
        if(this.value) {
            if(this.isSingleSelection()) {
                return this.isDateEquals(this.value, dateMeta);
            }
            else if(this.isMultipleSelection()) {
                let selected = false;
                for(let date of this.value) {
                    selected = this.isDateEquals(date, dateMeta);
                    if(selected) {
                        break;
                    }
                }
                
                return selected;
            }
            else if(this.isRangeSelection()) {
                if(this.value[1])
                    return this.isDateEquals(this.value[0], dateMeta) || this.isDateEquals(this.value[1], dateMeta) || this.isDateBetween(this.value[0], this.value[1], dateMeta);
                else
                    return this.isDateEquals(this.value[0], dateMeta)
            }
        }
        else
            return false;
    }
    
    isDateEquals(value, dateMeta) {
        if(value)
            return value.getDate() === dateMeta.day && value.getMonth() === dateMeta.month && value.getFullYear() === dateMeta.year;
        else
            return false;
    }
    
    isDateBetween(start, end, dateMeta) {
        let between : boolean = false;
        if(start && end) {
            let date: Date = new Date(dateMeta.year, dateMeta.month, dateMeta.day);
            return start.getTime() <= date.getTime() && end.getTime() >= date.getTime();
        }
        
        return between;
    }
    
    isSingleSelection(): boolean {
        return this.selectionMode === 'single';
    }
    
    isRangeSelection(): boolean {
        return this.selectionMode === 'range';
    }
    
    isMultipleSelection(): boolean {
        return this.selectionMode === 'multiple';
    }
    
    isToday(today, day, month, year): boolean {     
        return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
    }
    
    isSelectable(day, month, year): boolean {
        let validMin = true;
        let validMax = true;
        let validDate = true;
        let validDay = true;
        
        if(this.minDate) {
             if(this.minDate.getFullYear() > year) {
                 validMin = false;
             }
             else if(this.minDate.getFullYear() === year) {
                 if(this.minDate.getMonth() > month) {
                     validMin = false;
                 }
                 else if(this.minDate.getMonth() === month) {
                     if(this.minDate.getDate() > day) {
                         validMin = false;
                     }
                 }
             }  
        }
        
        if(this.maxDate) {
             if(this.maxDate.getFullYear() < year) {
                 validMax = false;
             }
             else if(this.maxDate.getFullYear() === year) {
                 if(this.maxDate.getMonth() < month) {
                     validMax = false;
                 }
                 else if(this.maxDate.getMonth() === month) {
                     if(this.maxDate.getDate() < day) {
                         validMax = false;
                     }
                 }
             }  
        }
        
        if(this.disabledDates) {
           validDate = !this.isDateDisabled(day,month,year);
        }
       
        if(this.disabledDays) {
           validDay = !this.isDayDisabled(day,month,year)
        }
        
        return validMin && validMax && validDate && validDay;
    }
    
    isDateDisabled(day:number, month:number, year:number):boolean {
        if(this.disabledDates) {
            for(let disabledDate of this.disabledDates) {
                if(disabledDate.getFullYear() === year && disabledDate.getMonth() === month && disabledDate.getDate() === day) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    isDayDisabled(day:number, month:number, year:number):boolean {
        if(this.disabledDays) {
            let weekday = new Date(year, month, day);
            let weekdayNumber = weekday.getDay();
            return this.disabledDays.indexOf(weekdayNumber) !== -1;
        }
        return false;
    }
    
    onInputFocus(event: Event) {
        this.focus = true;
        if(this.showOnFocus) {
            this.showOverlay();
        }
        this.onFocus.emit(event);
    }
    
    onInputBlur(event: Event) {
        this.focus = false;
        this.onBlur.emit(event);
        this.updateInputfield();
        this.onModelTouched();
    }
    
    onButtonClick(event,inputfield) {        
        if(!this.overlayViewChild.nativeElement.offsetParent || this.overlayViewChild.nativeElement.style.display === 'none') {
            inputfield.focus();
            this.showOverlay();
        }
        else
            this.overlayVisible = false;
            
        this.datepickerClick = true;
    }
    
    onInputKeydown(event) {
        this.isKeydown = true;
        if(event.keyCode === 9) {
            this.overlayVisible = false;
        }
    }
    
    onMonthDropdownChange(m: string) {
        this.currentMonth = parseInt(m);
        this.createMonth(this.currentMonth, this.currentYear);
    }
    
    onYearDropdownChange(y: string) {
        this.currentYear = parseInt(y);
        this.createMonth(this.currentMonth, this.currentYear);
    }
    
    incrementHour(event) {
        let newHour = this.currentHour + this.stepHour;

        if(this.validateHour(newHour)) {
            if(this.hourFormat == '24')
                this.currentHour = (newHour >= 24) ? (newHour - 24) : newHour;        
            else if(this.hourFormat == '12')
                this.currentHour = (newHour >= 13) ? (newHour - 12) : newHour;
            
            this.updateTime();
        }
    
        event.preventDefault();
    }
    
    decrementHour(event) {
        let newHour = this.currentHour - this.stepHour;
        
        if(this.validateHour(newHour)) {
            if(this.hourFormat == '24')
                this.currentHour = (newHour < 0) ? (24 + newHour) : newHour;        
            else if(this.hourFormat == '12')
                this.currentHour = (newHour <= 0) ? (12 + newHour) : newHour;
                
            this.updateTime();
        }

        event.preventDefault();
    }
    
    validateHour(hour): boolean {
        let valid: boolean = true;
        let valueDateString = this.value ? this.value.toDateString() : null;
        
        if(this.minDate && valueDateString && this.minDate.toDateString() === valueDateString) {
            if(this.minDate.getHours() > hour) {
                valid = false;
            }
        }
        
        if(this.maxDate && valueDateString && this.maxDate.toDateString() === valueDateString) {
            if(this.maxDate.getHours() < hour) {
                valid = false;
            }
        }
        
        return valid;
    }
    
    incrementMinute(event) {
        let newMinute = this.currentMinute + this.stepMinute;
        if(this.validateMinute(newMinute)) {
            this.currentMinute = (newMinute > 59) ? newMinute - 60 : newMinute;
            this.updateTime();
        }
                
        event.preventDefault();
    }
    
    decrementMinute(event) {
        let newMinute = this.currentMinute - this.stepMinute;
        if(this.validateMinute(newMinute)) {
            this.currentMinute = (newMinute < 0) ? 60 + newMinute : newMinute;
            this.updateTime();
        }
        
        event.preventDefault();
    }
    
    validateMinute(minute): boolean {
        let valid: boolean = true;
		let value = this.value; 
		if (this.isRangeSelection()) { value = this.value[1] || this.value[0]; } 
		if (this.isMultipleSelection()) { value = this.value[this.value.length - 1]; } 
		
		let hour = value.getHours(); 
		let valueDateString = value ? value.toDateString() : null; 
		if (this.minDate && valueDateString && this.minDate.toDateString() === valueDateString) { if(hour == this.minDate.getHours()){ if (this.minDate.getMinutes() > minute) { valid = false; } } } if (this.maxDate && valueDateString && this.maxDate.toDateString() === valueDateString) { if(hour == this.minDate.getHours()){ if (this.maxDate.getMinutes() < minute) { valid = false; } } } return valid;
    }
    
    incrementSecond(event) {
        let newSecond = this.currentSecond + this.stepSecond;
        if(this.validateSecond(newSecond)) {
            this.currentSecond = (newSecond > 59) ? newSecond - 60 : newSecond;
            this.updateTime();
        }
    
        event.preventDefault();
    }
    
    decrementSecond(event) {
        let newSecond = this.currentSecond - this.stepSecond;
        if(this.validateSecond(newSecond)) {
            this.currentSecond = (newSecond < 0) ? 60 + newSecond : newSecond;
            this.updateTime();
        }
        
        event.preventDefault();
    }
    
    validateSecond(second): boolean {
        let valid: boolean = true;
        let valueDateString = this.value ? this.value.toDateString() : null;
        
        if(this.minDate && valueDateString && this.minDate.toDateString() === valueDateString) {
            if(this.minDate.getSeconds() > second) {
                valid = false;
            }
        }
        
        if(this.maxDate && valueDateString && this.maxDate.toDateString() === valueDateString) {
            if(this.maxDate.getSeconds() < second) {
                valid = false;
            }
        }
        
        return valid;
    }
    
    updateTime() {
        let value = this.value ? new Date(this.value.getTime()) : new Date();
        if(this.hourFormat == '12') {
            if(this.currentHour === 12)
                value.setHours(this.pm ? 12 : 0);
            else
                value.setHours(this.pm ? this.currentHour + 12 : this.currentHour);
        }
        else {
            value.setHours(this.currentHour);
        }            
        
        value.setMinutes(this.currentMinute);
        value.setSeconds(this.currentSecond);
        this.updateModel(value);
        this.onSelect.emit(value);
        this.updateInputfield();
    }
    
    toggleAMPM(event) {
        this.pm = !this.pm;
        this.updateTime();
        event.preventDefault();
    }
    
    onUserInput(event) {
        // IE 11 Workaround for input placeholder : https://github.com/primefaces/primeng/issues/2026
        if(!this.isKeydown) {
            return;
        }
        this.isKeydown = false;
        
        let val = event.target.value;   
        try {
            let value = this.parseValueFromString(val);
            this.updateModel(value);
            this.updateUI();
        } 
        catch(err) {
            //invalid date
            this.updateModel(null);
        }
        
        this.filled = val != null && val.length;
        this.onInput.emit(event);
    }
    
    parseValueFromString(text: string): Date {
        if(!text || text.trim().length === 0) {
            return null;
        }
        
        let value: any;
        
        if(this.isSingleSelection()) {
            value = this.parseDateTime(text);
        }
        else if(this.isMultipleSelection()) {
            let tokens = text.split(',');
            value = [];
            for(let token of tokens) {
                value.push(this.parseDateTime(token.trim()));
            }
        }
        else if(this.isRangeSelection()) {
            let tokens = text.split(' - ');
            value = [];
            for(let i = 0; i < tokens.length; i++) {
                value[i] = this.parseDateTime(tokens[i].trim());
            }
        }
        
        return value;
    }
    
    parseDateTime(text): Date {
        let date: Date;
        let parts: string[] = text.split(' ');
        
        if(this.timeOnly) {
            date = new Date();
            this.populateTime(date, parts[0], parts[1]);
        }
        else {
            if(this.showTime) {
                date = this.parseDate(parts[0], this.dateFormat);
                this.populateTime(date, parts[1], parts[2]);
            }
            else {
                 date = this.parseDate(text, this.dateFormat);
            }
        }
        
        return date;
    }
    
    populateTime(value, timeString, ampm) {
        if(this.hourFormat == '12' && !ampm) {
            throw 'Invalid Time';
        }
        
        this.pm = (ampm === 'PM' || ampm === 'pm');
        let time = this.parseTime(timeString);
        value.setHours(time.hour);
        value.setMinutes(time.minute);
        value.setSeconds(time.second);
    }
    
    updateUI() {
        let val = this.value||this.defaultDate||new Date();

        if (Array.isArray(val)){
            val = val[0];
        }

        this.createMonth(val.getMonth(), val.getFullYear());
        
        if(this.showTime||this.timeOnly) {
            let hours = val.getHours();
            
            if(this.hourFormat == '12') {
                this.pm = hours > 11;
                
                if(hours >= 12) {
                    this.currentHour = (hours == 12) ? 12 : hours - 12;
                }
                else {
                    this.currentHour = (hours == 0) ? 12 : hours;
                }
            }
            else {
                this.currentHour = val.getHours();
            }
            
            this.currentMinute = val.getMinutes();
            this.currentSecond = val.getSeconds();
        }
    }
    
    onDatePickerClick(event) {
        this.datepickerClick = true;
    }
    
    showOverlay() {
        this.overlayVisible = true;
        this.overlayShown = true;
        if(this.autoZIndex) {
            this.overlayViewChild.nativeElement.style.zIndex = String(this.baseZIndex + (++DomHandler.zindex));
        }
        
        this.bindDocumentClickListener();
    }
    
    alignOverlay() {
        if(this.appendTo)
            this.domHandler.absolutePosition(this.overlayViewChild.nativeElement, this.inputfieldViewChild.nativeElement);
        else
            this.domHandler.relativePosition(this.overlayViewChild.nativeElement, this.inputfieldViewChild.nativeElement);
    }

    writeValue(value: any) : void {
        this.value = value;
        if(this.value && typeof this.value === 'string') {
            this.value = this.parseValueFromString(this.value);
        }

        this.updateInputfield();
        this.updateUI();
    }
    
    registerOnChange(fn: Function): void {
        this.onModelChange = fn;
    }

    registerOnTouched(fn: Function): void {
        this.onModelTouched = fn;
    }
    
    setDisabledState(val: boolean): void {
        this.disabled = val;
    }
    
    // Ported from jquery-ui datepicker formatDate    
    formatDate(date, format) {
        if (!date) {
            return '';
        }

        let iFormat;
        const lookAhead = (match) => {
            const matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
            if (matches) {
                iFormat++;
            }
            return matches;
        },
            formatNumber = (match, value, len) => {
                let num = '' + value;
                if (lookAhead(match)) {
                    while (num.length < len) {
                        num = '0' + num;
                    }
                }
                return num;
            },
            formatName = (match, value, shortNames, longNames) => {
                return (lookAhead(match) ? longNames[value] : shortNames[value]);
            };
        let output = '';
        let literal = false;

        if (date) {
            for (iFormat = 0; iFormat < format.length; iFormat++) {
                if (literal) {
                    if (format.charAt(iFormat) === '\'' && !lookAhead('\'')) {
                        literal = false;
                    } else {
                        output += format.charAt(iFormat);
                    }
                } else {
                    switch (format.charAt(iFormat)) {
                        case 'd':
                            output += formatNumber('d', this.utc ? date.getUTCDate() : date.getDate(), 2);
                            break;
                        case 'D':
                            output += formatName('D', this.utc ? date.getUTCDay() : date.getDay(), this.locale.dayNamesShort, this.locale.dayNames);
                            break;
                        case 'o':
                            if (this.utc) {
                                output += formatNumber('o',
                                    Math.round((
                                        new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).getTime() -
                                        new Date(date.getUTCFullYear(), 0, 0).getTime()) / 86400000), 3);
                            } else {
                                output += formatNumber('o',
                                    Math.round((
                                        new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() -
                                        new Date(date.getFullYear(), 0, 0).getTime()) / 86400000), 3);
                            }
                            break;
                        case 'm':
                            output += formatNumber('m', (this.utc ? date.getUTCMonth() : date.getMonth()) + 1, 2);
                            break;
                        case 'M':
                            output += formatName('M', this.utc ? date.getUTCMonth() : date.getMonth(), this.locale.monthNamesShort, this.locale.monthNames);
                            break;
                        case 'y':
                            output += (lookAhead('y') ? (this.utc ? date.getUTCFullYear() : date.getFullYear()) :
                                ((this.utc ? date.getUTCFullYear() : date.getFullYear()) % 100 < 10 ? '0' : '') +
                                (this.utc ? date.getUTCFullYear() : date.getFullYear()) % 100);
                            break;
                        case '@':
                            output += date.getTime();
                            break;
                        case '!':
                            output += date.getTime() * 10000 + this.ticksTo1970;
                            break;
                        case '\'':
                            if (lookAhead('\'')) {
                                output += '\'';
                            } else {
                                literal = true;
                            }
                            break;
                        default:
                            output += format.charAt(iFormat);
                    }
                }
            }
        }
        return output;
    }
    
    formatTime(date) {
        if(!date) {
            return '';
        }
        
        let output = '';
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        
        if(this.hourFormat == '12' && hours > 11 && hours != 12) {
            hours-=12;
        }
        
        output += (hours < 10) ? '0' + hours : hours;
        output += ':';
        output += (minutes < 10) ? '0' + minutes : minutes;
        
        if(this.showSeconds) {
            output += ':';
            output += (seconds < 10) ? '0' + seconds : seconds;
        }
        
        if(this.hourFormat == '12') {
            output += date.getHours() > 11 ? ' PM' : ' AM';
        }
        
        return output;
    }
    
    parseTime(value) {
        let tokens: string[] = value.split(':');
        let validTokenLength = this.showSeconds ? 3 : 2;
        
        if(tokens.length !== validTokenLength) {
            throw "Invalid time";
        }
        
        let h = parseInt(tokens[0]);
        let m = parseInt(tokens[1]);
        let s = this.showSeconds ? parseInt(tokens[2]) : null;
        
        if(isNaN(h) || isNaN(m) || h > 23 || m > 59 || (this.hourFormat == '12' && h > 12) || (this.showSeconds && (isNaN(s) || s > 59))) {
            throw "Invalid time";
        }
        else {
            if(this.hourFormat == '12' && h !== 12 && this.pm) {
                h+= 12;
            }
            
            return {hour: h, minute: m, second: s};
        }
    }
    
    // Ported from jquery-ui datepicker parseDate 
    parseDate(value, format) {
        if(format == null || value == null) {
            throw "Invalid arguments";
        }

        value = (typeof value === "object" ? value.toString() : value + "");
        if(value === "") {
            return null;
        }

        let iFormat, dim, extra,
        iValue = 0,
        shortYearCutoff = (typeof this.shortYearCutoff !== "string" ? this.shortYearCutoff : new Date().getFullYear() % 100 + parseInt(this.shortYearCutoff, 10)),
        year = -1,
        month = -1,
        day = -1,
        doy = -1,
        literal = false,
        date,
        lookAhead = (match) => {
            let matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
            if(matches) {
                iFormat++;
            }
            return matches;
        },
        getNumber = (match) => {
            let isDoubled = lookAhead(match),
                size = (match === "@" ? 14 : (match === "!" ? 20 :
                (match === "y" && isDoubled ? 4 : (match === "o" ? 3 : 2)))),
                minSize = (match === "y" ? size : 1),
                digits = new RegExp("^\\d{" + minSize + "," + size + "}"),
                num = value.substring(iValue).match(digits);
            if(!num) {
                throw "Missing number at position " + iValue;
            }
            iValue += num[ 0 ].length;
            return parseInt(num[ 0 ], 10);
        },
        getName = (match, shortNames, longNames) => {
            let index = -1;
            let arr = lookAhead(match) ? longNames : shortNames;
            let names = [];
            
            for(let i = 0; i < arr.length; i++) {
                names.push([i,arr[i]]);
            }
            names.sort((a,b) => {
                return -(a[ 1 ].length - b[ 1 ].length);
            });
            
            for(let i = 0; i < names.length; i++) {
                let name = names[i][1];
                if(value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
                    index = names[i][0];
                    iValue += name.length;
                    break;
                }
            }

            if(index !== -1) {
                return index + 1;
            } else {
                throw "Unknown name at position " + iValue;
            }
        },
        checkLiteral = () => {
            if(value.charAt(iValue) !== format.charAt(iFormat)) {
                throw "Unexpected literal at position " + iValue;
            }
            iValue++;
        };

        for (iFormat = 0; iFormat < format.length; iFormat++) {
            if(literal) {
                if(format.charAt(iFormat) === "'" && !lookAhead("'")) {
                    literal = false;
                } else {
                    checkLiteral();
                }
            } else {
                switch (format.charAt(iFormat)) {
                    case "d":
                        day = getNumber("d");
                        break;
                    case "D":
                        getName("D", this.locale.dayNamesShort, this.locale.dayNames);
                        break;
                    case "o":
                        doy = getNumber("o");
                        break;
                    case "m":
                        month = getNumber("m");
                        break;
                    case "M":
                        month = getName("M", this.locale.monthNamesShort, this.locale.monthNames);
                        break;
                    case "y":
                        year = getNumber("y");
                        break;
                    case "@":
                        date = new Date(getNumber("@"));
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        day = date.getDate();
                        break;
                    case "!":
                        date = new Date((getNumber("!") - this.ticksTo1970) / 10000);
                        year = date.getFullYear();
                        month = date.getMonth() + 1;
                        day = date.getDate();
                        break;
                    case "'":
                        if(lookAhead("'")) {
                            checkLiteral();
                        } else {
                            literal = true;
                        }
                        break;
                    default:
                        checkLiteral();
                }
            }
        }

        if(iValue < value.length) {
            extra = value.substr(iValue);
            if(!/^\s+/.test(extra)) {
                throw "Extra/unparsed characters found in date: " + extra;
            }
        }

        if(year === -1) {
            year = new Date().getFullYear();
        } else if(year < 100) {
            year += new Date().getFullYear() - new Date().getFullYear() % 100 +
                (year <= shortYearCutoff ? 0 : -100);
        }

        if(doy > -1) {
            month = 1;
            day = doy;
            do {
                dim = this.getDaysCountInMonth(year, month - 1);
                if(day <= dim) {
                    break;
                }
                month++;
                day -= dim;
            } while (true);
        }

        if (this.utc)
            date = new Date(Date.UTC(year, month - 1, day));
        else
            date = this.daylightSavingAdjust(new Date(year, month - 1, day));

        if(date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            throw "Invalid date"; // E.g. 31/02/00
        }
        return date;
    }
    
    daylightSavingAdjust(date) {
        if(!date) {
            return null;
        }
        date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
        return date;
    }
    
    updateFilledState() {
        this.filled = this.inputFieldValue && this.inputFieldValue != '';
    }
    
    onTodayButtonClick(event) {
        let date: Date = new Date();
        let dateMeta = {day: date.getDate(), month: date.getMonth(), year: date.getFullYear(), today: true, selectable: true};
        
        this.createMonth(dateMeta.month, dateMeta.year);
        this.onDateSelect(event, dateMeta);
        this.onTodayClick.emit(event);
    }
    
    onClearButtonClick(event) {
        this.updateModel(null);
        this.updateInputfield();
        this.overlayVisible = false;
        this.onClearClick.emit(event);
    }
    
    bindDocumentClickListener() {
        if(!this.documentClickListener) {
            this.documentClickListener = this.renderer.listen('document', 'click', (event) => {
                if(!this.datepickerClick&&this.overlayVisible) {
                    this.overlayVisible = false;
                    this.onClose.emit(event);
                }
                
                this.datepickerClick = false;
                this.cd.detectChanges();
            });
        }
    }
    
    unbindDocumentClickListener() {
        if(this.documentClickListener) {
            this.documentClickListener();
            this.documentClickListener = null;
        }
    }
        
    ngOnDestroy() {
        this.unbindDocumentClickListener();
        
        if(!this.inline && this.appendTo) {
            this.el.nativeElement.appendChild(this.overlayViewChild.nativeElement);
        }
    }
}

@NgModule({
    imports: [CommonModule,ButtonModule,SharedModule],
    exports: [Calendar,ButtonModule,SharedModule],
    declarations: [Calendar]
})
export class CalendarModule { }
