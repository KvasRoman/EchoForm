import { FormModel } from "./form.model";
import { ModuleModel } from "./module.model";
import { RegistryNodeModel } from "./registry-node.model";

export interface PluginModel extends RegistryNodeModel<ModuleModel>{
    name: string,
    description: string,
    modules: ModuleModel[]
}