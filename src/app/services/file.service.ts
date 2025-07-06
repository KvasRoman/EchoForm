import { Injectable } from "@angular/core";
import { readDir } from "@tauri-apps/plugin-fs";

@Injectable({
    providedIn: 'root'
})
export class FileService{

    async getFilesFromFolder(path: string, fullPath: boolean = true): Promise<string[]>{
        const entries = await readDir(path);
        return entries.filter(file => file.isFile).map(file => {
            return `${path}/${file.name}`
        });
    }
}