import { FieldModel } from "./field.model";
import { RegistryNodeModel } from "./registry-node.model";

export interface FormModel extends RegistryNodeModel<any>{
    name: string,
    fields: FieldModel[]
}