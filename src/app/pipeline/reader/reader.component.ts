import { Component } from '@angular/core';
import { PipelineModel } from '../../common/models/pipeline/pipeline.model';
import { FieldModel } from '../../common/models/field.model';
import { FileInputComponent } from '../../common/file/file.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PipelineService } from '../../services/pipeline.service';
import { SequenceItemArgumentModel, SequenceItemModel } from '../../common/models/pipeline/sequence-item.model';
import RegistryService from '../../services/registry.service';
import TreeService from '../../services/tree.service';
import { RegistryModel } from '../../common/models/registry.model';
import { FormModel } from '../../common/models/form.model';
import { PipelineFormField, PipelineFormGroupModel, PipelineFormModel } from '../../common/models/pipeline/pipeline-form.model';
import { CommonValueService } from '../../services/common-value.service';
import { skip, Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-pipeline-reader',
  standalone: true,
  imports: [FileInputComponent, ReactiveFormsModule, AsyncPipe],
  templateUrl: './reader.component.html',
  styleUrl: './reader.component.css'
})
export class PipelineReaderComponent {
  pipeline: PipelineModel;
  pipelineForm: FormGroup;
  registry: RegistryModel;
  private _commonSubs: Subscription[] = [];
  pipelineFormModel: PipelineFormModel;
  constructor(private fb: FormBuilder,
    public commonValues: CommonValueService, 
    private pipelineService: PipelineService, 
    private registryService: RegistryService, 
    private treeService: TreeService) {
    registryService.registry.subscribe(registry => {
      this.registry = registry;
    })
    pipelineService.activePipeline.subscribe(pipeline => {

      if (!pipeline) return;

      this.pipeline = pipeline;
      this.initCommonVariables(pipeline);
      this.updatePipelineForm();
    });

  }
  private initCommonVariables(pipeline: PipelineModel) {
  const commons = pipeline?.variables?.common ?? [];
  for (const v of commons) {
    // ensure bucket exists; initial value is undefined unless you want defaults
    this.commonValues.ensure(v.name);
  }
}
  getFormFieldsFromSequence(sequenceItem: SequenceItemModel): PipelineFormField[] {
    const pluginBranch = this.treeService.getBranchElements(this.registry,
      [sequenceItem.plugin, sequenceItem.module, sequenceItem.form]);
    const pluginForm = pluginBranch ? pluginBranch[2] as FormModel : undefined;
    if (!pluginForm) throw Error("getFormFieldsFromSequence: plugin was not found")
    else {
      const fieldsWithBinding = pluginForm.fields.map(field => {
        const boundArg = sequenceItem.arguments.find(arg => arg.name == field.name);
        return {...boundArg,...field} as PipelineFormField
      });
      return fieldsWithBinding;
    }
  }
  getFormFields(formId: string): FieldModel[] {
    const branch = this.treeService.getBranchById(this.registry, formId);
    if (branch) {
      const form = branch[branch.length - 1] as FormModel;
      return form.fields;
    }

    throw Error("branch not found");
  }
  updatePipelineForm() {
    this.pipelineFormModel = this.createFormModel(this.pipeline);
    const controlsConfig = this.createFormFields();
    this.pipelineForm = this.fb.group(controlsConfig);

    for (const group of this.pipelineFormModel.groups) {
    for (const field of group.fields) {
      const controlName = this.getFieldFor(group, field);
      this.wireCommonBinding(this.pipelineForm, controlName, field);
    }
  }
  }
  getFieldFor(group: PipelineFormGroupModel, field: PipelineFormField){
    return `${group.name}-${field.isBound?field.boundTo:'unbound'}-${field.name}`;
  }
  createFormModel(pipeline: PipelineModel): PipelineFormModel {
    const commonGroup = {
      name: "common",
      fields: pipeline.variables.common.map(v => v as PipelineFormField)
    } as PipelineFormGroupModel;
    const sequenceGroups: PipelineFormGroupModel[] = pipeline.sequence.map((sequenceItem, index) => ({
      name: `sequence-${index}`,
      fields: this.getFormFieldsFromSequence(sequenceItem)
    } as PipelineFormGroupModel));
    return {groups: [commonGroup, ...sequenceGroups]} as PipelineFormModel
  }
  createFormFields() {
    if (this.pipeline) {
      const commonGroup = this.pipelineFormModel.groups.find(group => group.name.includes("common"));
      const sequenceGroups = this.pipelineFormModel.groups.filter(group => group.name.includes("sequence"));
      let commonFields = undefined;
      if(commonGroup)
        commonFields = Object.fromEntries(commonGroup.fields
      .map(field => [`${commonGroup.name}-${"unbound"}-${field.name}`,""]))
      const sequenceFieldsArray = sequenceGroups
        .map(group => group.fields
          .map(field => [`${group.name}-${field.isBound?field.boundTo:"unbound"}-${field.name}`,""]))
          .reduce((accumulator, current) => accumulator.concat(current), []);
      let sequenceFields = Object.fromEntries(sequenceFieldsArray);
      return { ...commonFields, ...sequenceFields };
    }
  }
   private wireCommonBinding(group: FormGroup, controlName: string, field: PipelineFormField) {
    // uses your existing schema: isBound + boundTo
    if (!field?.isBound || !field?.boundTo) return;

    const control = group.get(controlName);
    if (!control) return;

    // Initial sync
    const existing = this.commonValues.peek(field.boundTo);
    if (existing !== undefined) {
      control.setValue(existing, { emitEvent: false });
    } else {
      this.commonValues.set(field.boundTo, control.value);
    }

    // registry -> control
    const s1 = this.commonValues.get$(field.boundTo).subscribe(v => {
      if (control.value !== v) control.setValue(v, { emitEvent: false });
    });

    // control -> registry
    const s2 = control.valueChanges.pipe(skip(1)).subscribe(v => {
      this.commonValues.set(field.boundTo!, v);
    });

    this._commonSubs.push(s1, s2);
  }

  private buildGroup(g: PipelineFormGroupModel): FormGroup {
  const group = this.fb.group({});
  for (const field of g.fields) {
    const controlName = field.name; // or your existing getFieldFor(...)
    // create the control as you already do (with validators/defaults)
    group.addControl(controlName, this.fb.control(''));
    // >>> ADD:
    this.wireCommonBinding(group, controlName, field as PipelineFormField);
  }
  return group;
}
decomposeForm() {
  if (!this.pipeline || !this.pipelineForm || !this.pipelineFormModel) return;

  const raw = this.pipelineForm.getRawValue(); // includes disabled
  const result: {
    variables: { common: Record<string, unknown> };
    sequence: Array<{ arguments: Array<{ name: string; isBound: boolean; boundTo?: string; value: unknown }> }>;
  } = {
    variables: { common: {} },
    sequence: (this.pipeline.sequence ?? []).map(() => ({ arguments: [] })),
  };

  // 1) collect all field values; for the common group prefer boundTo as key
  for (const group of this.pipelineFormModel.groups) {
    for (const field of group.fields) {
      const cn = this.getFieldFor(group, field);
      const controlVal = raw[cn];

      if (group.name === 'common') {
        const key = field.boundTo || field.name;
        result.variables.common[key] = controlVal;
      } else {
        const idx = this.parseSequenceIndex(group.name);
        if (idx != null) {
          if (!result.sequence[idx]) result.sequence[idx] = { arguments: [] };

          // 2) for bound args use the common value (controls may be disabled/empty)
          const value =
            field.isBound && field.boundTo
              ? (result.variables.common[field.boundTo] ??
                 this.commonValues.peek(field.boundTo) ??   // fall back to live bucket
                 controlVal)                            // final fallback
              : controlVal;

          result.sequence[idx].arguments.push({
            name: field.name,
            isBound: !!field.isBound,
            boundTo: field.isBound ? field.boundTo : undefined,
            value,
          });
        }
      }
    }
  }

  console.log('decomposed', result);
  return result;
}

private parseSequenceIndex(name: string): number | null {
  const m = name?.match(/sequence[-_](\d+)/i);
  return m ? Number(m[1]) : null;
}


  onSubmit(){
    console.log("submit", this.pipelineForm.value);
    this.decomposeForm();
  }
  ngOnDestroy() {
  this._commonSubs.forEach(s => s.unsubscribe());
}
}
