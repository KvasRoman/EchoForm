import { Component, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { open, save } from "@tauri-apps/plugin-dialog"
import { readFile } from "@tauri-apps/plugin-fs"
import { NotFoundError } from 'rxjs';
@Component({
  selector: 'app-file-input',
  standalone: true,
  imports: [],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss',
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
  setDisabledState?(isDisabled: boolean): void { }

  private onChange: (value: string) => void =  (value) => {};
  private onTouched: () => void = () => {};
  @Input() isOutput: boolean;
  @Input() type: "path" | "content";
  data: string;

  async openFile() {

    if (this.isOutput) {
      let file = await save({
        filters: [
          {
            name: '.sgn',
            extensions: ['sgn', 'txt']
          }
        ]
      });
      if(!file || file == '') {
        return;
      }
      this.data = file;
      this.onChange(this.data);
      
    } else {
      let file = await open({
        multiple: false,
        directory: false
      })
      if(!file || file == '') {
        return;
      }
      switch (this.type) {
        case "path": this.data = file!; break;
        case "content": this.data = await this.readFile(file!); break;
        default: throw new Error(`file input type: ${this.type} is not supported yet`);
      }
      this.onChange(this.data);
    }
  }
  private async readFile(path: string): Promise<string> {
    let fileContent = await readFile(path, {})
    return new TextDecoder().decode(fileContent);
  }
}
