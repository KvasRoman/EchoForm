import { Injectable } from "@angular/core";
import { documentDir } from '@tauri-apps/api/path';
import { readTextFile, writeTextFile, BaseDirectory, readDir, DirEntry } from '@tauri-apps/plugin-fs';

import { BehaviorSubject, Observable, Subject } from "rxjs";

import { v4 as uuidv4 } from 'uuid';

import { RegistryModel } from "../common/models/registry.model";
import { PluginModel } from "../common/models/plugin.model";
import { RegistryNodeModel } from "../common/models/registry-node.model";
import { FormModel } from "../common/models/form.model";
import { PipelineModel } from "../common/models/pipeline/pipeline.model";
import TreeService from "./tree.service";

@Injectable({ providedIn: "root" })
export default class RegistryService {
  private readonly pluginFolderName = "echoform-plugins";
  private readonly pipelineFolderName = "echoform-pipelines";
  private pluginsDir: string;
  private pipelinesDir: string;
  private _registrySubject: BehaviorSubject<RegistryModel>;
  get registry(): Observable<RegistryModel> {
    return this._registrySubject.asObservable();
  }
  get pluginDirectory(): string{
    return this.pluginsDir;
  }
  constructor(private treeService: TreeService) {
    this._registrySubject = new BehaviorSubject<RegistryModel>(REGISTRY_EXAMPLE);
  }
  async loadDirs() {
    this.pluginsDir = `${await documentDir()}/${this.pluginFolderName}`;
    this.pipelinesDir = `${await documentDir()}/${this.pipelineFolderName}`;
  }
  async loadRegistry() {
    const dirs = (await readDir(this.pluginsDir)).filter(entity => !entity.isFile);

    //let validDirs = this.getValidPluginFolders(dirs);
    const pluginFolders = await this.getValidPluginFolders(dirs);
    const registry = await this.createRegistry(pluginFolders);
    for (const plugin of registry.plugins) {
      this.injectIds(plugin);
    }
    this.loadPipelines(registry);

    this.updatePluginFiles(registry);
    console.log("registry", registry);
    this._registrySubject.next(registry);

    console.log("dirr", dirs);
  }
// For pipelines
  private async loadPipelines(registry: RegistryModel){
    const pipelineFiles = (await readDir(this.pipelinesDir)).filter(
      file => {
        if (file.isFile) {
          let filename = file.name.toLowerCase();
          let isProperFileType = filename.includes(".json");
          return isProperFileType;
        }
        else {
          return false;
        }
      });
    const pipelineFilePaths = pipelineFiles.map(file => `${this.pipelinesDir}/${file.name}`);
    const pipelines = await Promise.all(pipelineFilePaths.map(
      async file => await this.createPipeline(file)
    ));
    const validPipelines = this.getValidPipelines(pipelines,registry);
    const alteredPipelines = validPipelines.map(pipeline => this.injectFormIds(registry, pipeline))
    registry.pipelines = alteredPipelines;
  }
  private async createPipeline(file: string): Promise<PipelineModel>{
    const json = await readTextFile(file);
    const pipeline = JSON.parse(json) as PipelineModel;
    return pipeline;
  }
  private getValidPipelines(pipelines: PipelineModel[], registry: RegistryModel): PipelineModel[]{
    pipelines.filter(pipeline => {
      const pluginsExist = pipeline.plugins.filter(
        pipelinePlugin => registry.plugins.find(
          registryPlugin => pipelinePlugin == registryPlugin.name)
        ).length == pipeline.plugins.length;
      
      const sequenceFormExists = pipeline.sequence.filter(
        sequenceItem => {
        return this.treeService.getBranchElements(registry, 
          [sequenceItem.plugin,sequenceItem.module,sequenceItem.form]);
      }).length == pipeline.sequence.length;
      
      const correctSequenceArguments = pipeline.sequence.filter(sequenceItem => {
        if(sequenceItem.arguments){
          const argumentList = Object.keys(sequenceItem.arguments);
          const branch = this.treeService.getBranchElements(registry, 
            [sequenceItem.plugin,sequenceItem.module,sequenceItem.form])
          if(branch){
            const form = branch[branch.length-1] as FormModel;
            const formFiledNames = form.fields.map(field => field.name);
            return argumentList.every(argument => formFiledNames.includes(argument));
          }
          else return false;
        }
        else return true;
      }).length == pipeline.sequence.length;  

      return pluginsExist && sequenceFormExists && correctSequenceArguments;
    });
    return pipelines;
  }
  private injectFormIds(registry: RegistryModel, pipeline: PipelineModel): PipelineModel{
    for(const sequenceItem of pipeline.sequence){
      const branch = this.treeService.getBranchElements(registry, [sequenceItem.plugin,sequenceItem.module,sequenceItem.form]);
      if(branch){
        const form = branch[2];
        sequenceItem.formId = form.id;
      }
      else{
        throw Error("injectFromIds - branch not found");
      }
    }
    return pipeline;
  }
// For plugins
  private async getValidPluginFolders(dirs: DirEntry[]): Promise<DirEntry[]> {
    return dirs.filter(async plugin => await this.isValidPlugin(plugin.name));
  }
  private async isValidPlugin(pluginName: string): Promise<boolean> {
    let pluginFiles = (await readDir(this.pluginsDir)).filter(
      file => {
        if (file.isFile) {
          let filename = file.name.toLowerCase();
          let isProperFileType = filename.includes(".exe") || filename.includes(".json");
          let isNameEqual = pluginName.toLocaleLowerCase() == this.getFileName(file.name)
          return isProperFileType && isNameEqual;
        }
        else {
          return false;
        }
      });
    return pluginFiles.length == 2;
  }
  private getFileName(filename: string) {
    return filename.replace(/\.[^/.]+$/, '');
  }
  private async createRegistry(plugins: DirEntry[]): Promise<RegistryModel> {
    const registry: RegistryModel = {
      pipelines: [],
      plugins: []
    }
    for (const plugin of plugins) {
      let p = this.injectChildren(await this.createPlugin(plugin));
      registry.plugins.push(p)
      console.log("p", JSON.stringify(p, (key, value) => {
        if (key === 'children') return undefined;
        return value;
      }));
    }

    return registry;
  }
  private async createPlugin(plugin: DirEntry): Promise<PluginModel> {
    const path = `${this.pluginsDir}/${plugin.name}/${plugin.name}.json`
    const json = await readTextFile(path);
    return JSON.parse(json) as PluginModel;
  }
  private injectChildren(plugin: PluginModel): PluginModel {


    //inject forms
    for (const module of plugin.modules) {
      Object.defineProperty(module, "children", {
        get() {
          return this.forms;
        },
        enumerable: true,
        configurable: true
      })
    }

    //inject modules
    Object.defineProperty(plugin, "children", {
      get() {
        return this.modules;
      },
      enumerable: true,
      configurable: true
    })
    return plugin;
  }
  private injectIds(plugin: PluginModel): PluginModel {
    const modules = plugin.modules;
    plugin.id = plugin.id ? plugin.id : uuidv4();
    for (const module of modules) {
      module.id = module.id ? module.id : uuidv4();
      const forms = module.forms;
      for (const form of forms) {
        form.id = form.id ? form.id : uuidv4();
      }
    }

    return plugin;
  }
  private updatePluginFiles(registry: RegistryModel) {

    for (const plugin of registry.plugins) {
        this.savePluginConfig(plugin);
    }
  }
  private async savePluginConfig(plugin: PluginModel) {
    const pluginDir = this.pluginsDir;
    const json = JSON.stringify(plugin, (key, value) => {
      if (key === 'children') return undefined;
      return value;
    })
    await writeTextFile(`${pluginDir}/${plugin.name}/${plugin.name}.json`,json, {

    });
  }
}

const REGISTRY_EXAMPLE: RegistryModel = {
  pipelines: [],
  plugins: [
    {
      id: "hello1",
      name: "hello",
      modules: [
        {
          id: "world1",
          name: "world",
          forms: [
            {
              id: "temp1",
              name: "temp1",
              fields: []
            }
          ],
          get children() {
            return this.forms;
          }
        }

      ],
      get children() {
        return this.modules;
      }
      ,
      description: ""
    },
    {
      id: "hello2",
      name: "hello",
      modules: [
        {
          id: "world2",
          name: "world",
          forms: [],
        }
      ],
      get children() {
        return this.modules;
      },
      description: ""
    }
  ]
}