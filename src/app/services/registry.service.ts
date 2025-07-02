import { Injectable } from "@angular/core";
import { documentDir } from '@tauri-apps/api/path';

import { readTextFile, BaseDirectory, readDir } from '@tauri-apps/plugin-fs';
@Injectable({providedIn: "root"})
export default class RegistryService{
    private _plugins = []
    private _pipelines = []
    private pluginFolderName = "echoform-plugins";
    private pipelineFolderName = "echoform-pipelines";
    async loadPlugins(){
        let documents = await documentDir()
        let pluginsDir = `${documents}/${this.pluginFolderName}`;
        let dirs = (await readDir(pluginsDir)).filter(entity => !entity.isFile);
        let text = await readTextFile(`${pluginsDir}/test.json`);
        console.log(text); 

        console.log("dirr",dirs);
    }
    get plugins (){
        return null;
    }

}