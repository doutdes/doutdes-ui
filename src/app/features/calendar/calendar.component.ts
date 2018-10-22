import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Breadcrumb} from '../../core/breadcrumb/Breadcrumb';
import {BreadcrumbActions} from '../../core/breadcrumb/breadcrumb.actions';

import {Subject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

import {BsModalRef} from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {BsModalService} from 'ngx-bootstrap/modal';

import {CalendarEvent, CalendarEventTimesChangedEvent, CalendarView} from 'angular-calendar';

import {endOfDay, isSameDay, isSameMonth, startOfDay} from 'date-fns';
import {CalendarService} from '../../shared/_services/calendar.service';

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

  viewDate: Date = new Date();
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  activeDayIsOpen: boolean = false;
  refresh: Subject<any> = new Subject();

  // events: CalendarEvent[] = [
  //   {
  //     start: subDays(startOfDay(new Date()), 1),
  //     end: addDays(new Date(), 1),
  //     title: 'A 3 day event',
  //     color: colors.red,
  //     allDay: true,
  //     resizable: {
  //       beforeStart: true,
  //       afterEnd: true
  //     },
  //     draggable: true
  //   },
  //   {
  //     start: subDays(endOfMonth(new Date()), 3),
  //     end: addDays(endOfMonth(new Date()), 3),
  //     title: 'A long event that spans 2 months',
  //     color: colors.blue,
  //     allDay: true
  //   },
  //   {
  //     start: addHours(startOfDay(new Date()), 2),
  //     end: new Date(),
  //     title: 'A draggable and resizable event',
  //     color: colors.yellow,
  //     resizable: {
  //       beforeStart: true,
  //       afterEnd: true
  //     },
  //     draggable: true
  //   }
  // ];

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
    this.events.push({
      title: 'New event',
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      color: colors.red,
      draggable: true,
      resizable: {
        beforeStart: true,
        afterEnd: true
      }
    });
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
            }
          };

          this.events.push(toAdd);
          this.refresh.next();
        });
      }, err => {
        console.log(err);
      });
  }
}
