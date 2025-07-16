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

@Component({
  selector: 'app-pipeline-reader',
  standalone: true,
  imports: [FileInputComponent, ReactiveFormsModule],
  templateUrl: './reader.component.html',
  styleUrl: './reader.component.css'
})
export class PipelineReaderComponent {
  pipeline: PipelineModel;
  pipelineForm: FormGroup;
  registry: RegistryModel;
  pipelineFormModel: PipelineFormModel;
  constructor(private fb: FormBuilder, private pipelineService: PipelineService, private registryService: RegistryService, private treeService: TreeService) {
    registryService.registry.subscribe(registry => {
      this.registry = registry;
    })
    pipelineService.activePipeline.subscribe(pipeline => {

      if (!pipeline) return;

      this.pipeline = pipeline;
      this.updatePipelineForm();
    });

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
    this.pipelineForm = this.fb.group(this.createFormFields());
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
}
