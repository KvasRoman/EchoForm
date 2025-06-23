import { Component, Input, Output } from '@angular/core';
import { open } from "@tauri-apps/plugin-dialog"
import { readFile } from "@tauri-apps/plugin-fs" 
import { NotFoundError } from 'rxjs';
@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [],
  templateUrl: './file-input.component.html',
  styleUrl: './file-input.component.scss'
})
export class FileInputComponent {
    @Input() type: "path" | "content";
    @Output() data: string;
    
    async openFile(){
      let file = await open({
        multiple: false,
        directory: false
      })
      switch(this.type){
        case "path": this.data = file!; break;
        case "content": this.data = await this.readFile(file!); break;
        default: throw new NotFoundError(`file input type: ${this.type} is not supported yet`);
      }
    }
    private async readFile(path: string): Promise<string>{
      let fileContent = await readFile(path, {})      
      return new TextDecoder().decode(fileContent);
    }
}
