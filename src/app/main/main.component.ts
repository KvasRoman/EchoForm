import { Component, inject, OnInit } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { FormModel } from '../form/form.model';

import { open } from "@tauri-apps/plugin-dialog"
import { CommandService } from '../services/command.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [FormComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private commandService = inject(CommandService);
  ngOnInit(): void {   
    this.commandService.Execute("/C","echo",["hello"]);
  }
  async openFile(){
    const file = await open({
      multiple: false,
      directory: false
    })
    console.log("file",file);
  }
  testForm: FormModel = {
    name: "test",
    fields: [{
      name: "someNumber",
      type: "number"
    },
  {name: "someText",
    type: "text"
  }]
  }

}
