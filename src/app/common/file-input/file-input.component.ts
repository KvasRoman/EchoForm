import { Component, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { open } from "@tauri-apps/plugin-dialog"
import { readFile } from "@tauri-apps/plugin-fs" 
import { NotFoundError } from 'rxjs';
@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [],
  templateUrl: './file-input.component.html',
  styleUrl: './file-input.component.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    multi: true,
    useExisting: FileInputComponent
  }]
})
export class FileInputComponent implements ControlValueAccessor {
    writeValue(value: string): void {
      this.data = value
    }
    registerOnChange(fn: (value: string) => void): void {
      this.onChange = fn;
    }
    registerOnTouched(fn: () => void): void {
      this.onTouched = fn;
    }
    setDisabledState?(isDisabled: boolean): void {}

    private onChange: (value: string) => void;
    private onTouched: () => void;

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
      this.onChange(this.data);
    }
    private async readFile(path: string): Promise<string>{
      let fileContent = await readFile(path, {})      
      return new TextDecoder().decode(fileContent);
    }
}
