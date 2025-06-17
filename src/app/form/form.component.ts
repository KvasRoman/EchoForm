import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormModel } from './form.model';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  @Input() formModel?: FormModel;

  dynamicForm?: FormGroup;
  constructor(private fb: FormBuilder) {
    
  }
  ngOnInit(): void {
    let formFields = Object.fromEntries(
      this.formModel!.fields.map(field => [field.name, ""])
    );
    console.log("fields", formFields);
    this.dynamicForm = this.fb.group(formFields);

  }
  onSubmit(){
    console.log("hello",this.dynamicForm!.getRawValue());
    
  }
}
