import { Injectable } from "@angular/core";
import { documentDir } from '@tauri-apps/api/path';
import { readTextFile, writeTextFile, BaseDirectory, readDir, DirEntry } from '@tauri-apps/plugin-fs';

import { BehaviorSubject, Observable } from "rxjs";

import { v4 as uuidv4 } from 'uuid';

import { RegistryModel } from "../common/models/registry.model";
import { PluginModel } from "../common/models/plugin.model";
import { RegistryNodeModel } from "../common/models/registry-node.model";
import { FormModel } from "../common/models/form.model";

@Injectable({ providedIn: "root" })
export default class RegistryService {
  private _plugins = []
  private _pipelines = []
  private readonly pluginFolderName = "echoform-plugins";
  private readonly pipelineFolderName = "echoform-pipelines";
  private pluginsDir: string;
  private _registrySubject: BehaviorSubject<RegistryModel>;
  private _formSubject: BehaviorSubject<FormModel>;
  get registry(): Observable<RegistryModel> {
    return this._registrySubject.asObservable();
  }
  get activeFrom(): Observable<FormModel> {
    return this._formSubject.asObservable();
  }
  get pluginDirectory(): string{
    return this.pluginsDir;
  }
  constructor() {
    this._registrySubject = new BehaviorSubject<RegistryModel>(REGISTRY_EXAMPLE);
  }
  async loadDirs() {
    this.pluginsDir = `${await documentDir()}/${this.pluginFolderName}`;
  }
  async loadRegistry() {
    const dirs = (await readDir(this.pluginsDir)).filter(entity => !entity.isFile);

    //let validDirs = this.getValidPluginFolders(dirs);
    const pluginFolders = await this.getValidPluginFolders(dirs);
    const registry = await this.createRegistry(pluginFolders);
    for (const plugin of registry.plugins) {
      this.injectIds(plugin);
    }
    this.updatePluginFiles(registry);
    console.log("registry", registry);
    this._registrySubject.next(registry);

    console.log("dirr", dirs);
  }
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