import { FieldModel } from "../field.model"
import { SequenceItemModel } from "./sequence-item.model"

export interface PipelineModel{
    name: string,
    plugins: string[],
    variables: {
        common: FieldModel[]
    },
    sequence: SequenceItemModel[]
}