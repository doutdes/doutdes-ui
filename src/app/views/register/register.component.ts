import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';


@Component({
  selector: 'app-dashboard',
  templateUrl: 'register.component.html'
})
export class RegisterComponent implements OnInit{

  userChoice: FormGroup;
  selectedUser: string = 'company';

  constructor(
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.userChoice = this.formBuilder.group({
      userType: ['', Validators.required]
    });
  }

  get getUserType() {
    return this.userChoice.controls.userType.value;
  }

  selectChangeHandler (event: any) {
    this.selectedUser = event.target.value;
  }

}
