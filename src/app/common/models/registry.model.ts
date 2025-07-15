import { PipelineModel } from "./pipeline/pipeline.model";
import { PluginModel } from "./plugin.model";


export interface RegistryModel{
    plugins: PluginModel[];
    pipelines: PipelineModel[];
}