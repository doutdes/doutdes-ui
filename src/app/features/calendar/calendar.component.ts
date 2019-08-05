import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';

import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';

import {CalendarEvent, CalendarEventTimesChangedEvent, CalendarView, DAYS_OF_WEEK} from 'angular-calendar';

import {endOfDay, isSameDay, isSameMonth, startOfDay} from 'date-fns';
import {CalendarService} from '../../shared/_services/calendar.service';
import {NewCalendar} from '../../shared/_models/Calendar';
import {TranslateService} from '@ngx-translate/core';
import {UserService} from '../../shared/_services/user.service';
import {User} from '../../shared/_models/User';
import {GlobalEventsManagerService} from '../../shared/_services/global-event-manager.service';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};

@Component({
  selector: 'app-feature-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FeatureCalendarComponent implements OnInit, OnDestroy{

  @ViewChild('showEvent') showEvent: ElementRef;

  modalRef: BsModalRef;
  modalData: any;

  updateForm: FormGroup;

  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;
  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  activeDayIsOpen: boolean = false;
  refresh: Subject<any> = new Subject();

  lang: string;
  value: string;
  tmp: string;
  user: User;

  tmp_title: string = null;

  events: CalendarEvent[] = [];
  public locale: 'it';

  constructor(
    private breadcrumbActions: BreadcrumbActions,
    private calendarService: CalendarService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    public translate: TranslateService,
    private userService: UserService,
    private GEservice: GlobalEventsManagerService
    ) {
    this.userService.get().subscribe(value => {
      this.tmp_title = this.checkTitle(value.lang);
    });

  }

  ngOnInit(): void {

    this.updateForm = this.formBuilder.group({
      eventTitle: ['', Validators.compose([Validators.maxLength(50), Validators.required])],
      dataStart: ['', Validators.compose([Validators.required])],
      dataEnd: ['', Validators.compose([Validators.required])],
      primaryColor: ['', Validators.compose([Validators.required])],
      secondaryColor: ['', Validators.compose([Validators.required])]
    });

    this.loadEvents();
    this.addBreadcrumb();

  }

  ngOnDestroy(): void {
    this.removeBreadcrumb();
  }

  addBreadcrumb() {
    const bread = [] as Breadcrumb[];

    bread.push(new Breadcrumb('Home', '/'));

    this.userService.get().subscribe(data => {
      switch (data.lang) {
        case 'it':
          bread.push(new Breadcrumb('Calendario', '/calendar/'));
          break;
        case 'en':
          bread.push(new Breadcrumb('Calendar', '/calendar/'));
          break;
        default:
          bread.push(new Breadcrumb('Calendario', '/calendar/'));
          break;
      }
    });

    this.breadcrumbActions.updateBreadcrumb(bread);
  }

  removeBreadcrumb() {
    this.breadcrumbActions.deleteBreadcrumb();
  }

  changeView(view) {
    this.view = view;
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {

    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      this.activeDayIsOpen = (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0;
      this.refresh.next();
    }
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = {event, action};
    this.updateControls(event);
    this.openModal();
  }

  eventTimesChanged({event, newStart, newEnd}: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }

  addEvent(): void {
    let event: CalendarEvent = {
      title: this.tmp_title,
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      color: colors.red,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true
      },
      meta: {
        id: null
      }
    };

    this.calendarService.addEvent(event)
      .subscribe((eventAdded: NewCalendar) => event.meta.id = eventAdded.id, err => console.log(err));

    this.events.push(event);
    this.refresh.next();
  }

  openModal() {
    this.modalRef = this.modalService.show(this.showEvent, {class: 'modal-md modal-dialog-centered'});
  }

  closeModal(): void {
    this.modalRef.hide();
  }

  updateControls(event: CalendarEvent) {
    this.updateForm.controls['eventTitle'].setValue(event.title);
    this.updateForm.controls['dataStart'].setValue(event.start.toISOString().substring(0, 23));
    this.updateForm.controls['dataEnd'].setValue(event.end.toISOString().substring(0, 23));
    this.updateForm.controls['primaryColor'].setValue(event.color.primary);
    this.updateForm.controls['secondaryColor'].setValue(event.color.secondary);
  }

  loadEvents() {
    this.calendarService.getEvents()
      .subscribe(eventsToLoad => {
        if(eventsToLoad) {
          eventsToLoad.forEach(async el => {
            const colors = {
              primary: el.primaryColor,
              secondary: el.secondaryColor
            };

            const toAdd: CalendarEvent = {
              title: el.title,
              start: new Date(el.dataStart),
              end: new Date(el.dataEnd),
              color: colors,
              draggable: true,
              resizable: {
                beforeStart: true,
                afterEnd: true
              },
              meta: {
                id: el.id,
                user_id: el.user_id
              }
            };

            this.events.push(toAdd);
            this.refresh.next();
          });
        }
      }, err => {
        console.log(err);
      });
  }

  eventUpdated(event) {
    this.calendarService.updateEvent(event)
      .subscribe(updated => {
      }, err => {
        console.log(err);
      });

  }

  deleteEvent(event, index) {
    this.events.splice(index, 1);

    this.calendarService.deleteEvent(event.meta.id)
      .subscribe(deleted => {
      }, err => {
        console.log(err);
      });
  }

  formatData(data: Date) {
    return data.toLocaleDateString('it-IT') + ' - ' + data.toLocaleTimeString('it-IT');
  }

  checkTitle(lang) {
    switch (lang) {
      case 'it':
        this.tmp_title = 'Nuovo evento';
        break;
      case 'en':
        this.tmp_title = 'New event';
        break;
      default:
        this.tmp_title = 'Nuovo evento';
    }

    return this.tmp_title;
  }

}
