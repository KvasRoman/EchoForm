import { FormModel } from "./form.model";
import { RegistryNodeModel } from "./registry-node.model";

export interface ModuleModel extends RegistryNodeModel<FormModel>{
    name: string,
    forms: FormModel[]
}