import { Injectable } from "@angular/core";
import { Command } from '@tauri-apps/plugin-shell'
@Injectable({
    providedIn: 'root'
})
export class CommandService{

     public async Execute(application: string, commandName: string, args: string[]){
        let command = Command.create("cmd",[application, commandName,...args]);
        let output = await command.execute();
        console.log("command has been launcheddd", output);
    }
}