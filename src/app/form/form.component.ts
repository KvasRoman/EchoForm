import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormModel } from '../common/models/form.model';
import { FieldType } from '../common/types/field.type';
import { Observable } from 'rxjs';
import { FormService } from '../services/form.service';
import { FileInputComponent } from '../common/file/file.component';
import { CommandService } from '../services/command.service';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FileInputComponent],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent implements OnInit {
  formModel: FormModel | null;
  dynamicForm?: FormGroup;
  activeFormSub: Observable<FormModel | null>;
  fields: {name: string, type: FieldType}[]

  constructor(private fb: FormBuilder, private formService: FormService, private commandService: CommandService) {
    this.activeFormSub = this.formService.activeFrom;
    this.activeFormSub.subscribe(form => {
      this.formModel = form;
      console.log('form',form);
      if(form)
        this.updateFromModel();
    })
  }
  ngOnInit(): void {

  }
  updateFromModel(){
    
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
