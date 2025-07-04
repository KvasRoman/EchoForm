import { Injectable } from "@angular/core";
import { Command } from '@tauri-apps/plugin-shell'
@Injectable({
    providedIn: 'root'
})
export class CommandService{

     public async Execute(application: string, commandName: string, args: string[]){
        let _args = ['/C','start' ,application, commandName,...args].join(' ');
        console.log(_args);
        let command = Command.create("cmd",[_args]);
        
        Command.create(application, [], {})
        let output = await command.execute();
        console.log("command has been launcheddd", output);
    }
}