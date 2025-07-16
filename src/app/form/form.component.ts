import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FormModel } from '../common/models/form.model';
import { FieldType } from '../common/types/field.type';
import { Observable } from 'rxjs';
import { FormService } from '../services/form.service';
import { FileInputComponent } from '../common/file/file.component';
import { CommandService } from '../services/command.service';
import { RegistryNodeModel } from '../common/models/registry-node.model';
import RegistryService from '../services/registry.service';
import { ModuleModel } from '../common/models/module.model';
import { PluginModel } from '../common/models/plugin.model';

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
  activeBranchSub: Observable<RegistryNodeModel<unknown>[]>;
  branch: RegistryNodeModel<unknown>[];
  fields: {name: string, type: FieldType}[]

  constructor(private fb: FormBuilder, private formService: FormService, private commandService: CommandService, private registryService: RegistryService) {
    this.activeFormSub = this.formService.activeFrom;
    this.activeFormSub.subscribe(form => {
      this.formModel = form;
      if(form)
        this.updateFromModel();
    });
    this.activeBranchSub = this.formService.activeBranch;
    this.activeBranchSub.subscribe(branch => {
      this.branch = branch;
    })
    
  }
  ngOnInit(): void {

  }
  updateFromModel(){
    
    let formFields = Object.fromEntries(
      this.formModel!.fields.map(field => [field.name, ""])
    );
    this.dynamicForm = this.fb.group(formFields);
  }
  onSubmit(){
    
    const pluginName = (this.branch[0] as PluginModel).name;
    const executable = `${this.registryService.pluginDirectory}/${pluginName}/${pluginName}.exe`;
    const module = (this.branch[1] as ModuleModel).name;
    const command = (this.branch[2] as FormModel).name;
    
    const formData = this.dynamicForm!.getRawValue();
    const args = Object.keys(formData).map(item => {
      return formData[item];
    });

    this.commandService.Execute(executable, module, [command, ...args])
  }
}
