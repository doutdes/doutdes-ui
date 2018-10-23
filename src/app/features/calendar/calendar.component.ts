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
import {e} from '@angular/core/src/render3';

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

  events: CalendarEvent[] = [];

  constructor(
    private breadcrumbActions: BreadcrumbActions,
    private calendarService: CalendarService,
    private modalService: BsModalService,
    private formBuilder: FormBuilder
    ) {
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
    bread.push(new Breadcrumb('Calendar', '/calendar/'));

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

      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
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
      title: 'New event',
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

        eventsToLoad.forEach(el => {
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
      }, err => {
        console.log(err);
      });
  }

  eventUpdated(event) {
    this.calendarService.updateEvent(event)
      .subscribe(updated => {
      }, err => {
        console.log(err);
      })

  }

  deleteEvent(event, index) {
    this.events.splice(index, 1);

    this.calendarService.deleteEvent(event.meta.id)
      .subscribe(deleted => {
        console.log('deleted: ' + deleted.deleted);
      }, err => {
        console.log(err);
      })
  }

  formatData(data: Date) {
    return data.toDateString() + ' - ' + data.toLocaleTimeString();//' - ' + data.getHours() + ':' + data.getMinutes() + ':' + data.getSeconds();
  }
}
