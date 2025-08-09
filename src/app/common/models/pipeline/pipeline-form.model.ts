import { FieldModel } from "../field.model";
import { SequenceItemArgumentModel } from "./sequence-item.model";

export interface PipelineFormModel {
    groups: PipelineFormGroupModel[];
}
export interface PipelineFormGroupModel{
    name: string,
    fields: PipelineFormField[]
}
export interface PipelineFormField extends SequenceItemArgumentModel, FieldModel{
    boundToField?: PipelineFormField;
    commonKey?: string; // <-- fields with the same key share the same value
}