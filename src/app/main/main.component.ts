import { Component, inject, OnInit } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { FormModel } from '../common/models/form.model';

import { open } from "@tauri-apps/plugin-dialog"
import { CommandService } from '../services/command.service';
import { PluginRegistryComponent } from '../plugin-registry/plugin-registry.component';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [PluginRegistryComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private commandService = inject(CommandService);
  
  ngOnInit(): void {   
    this.commandService.Execute("/C","echo",["hello"]);
    this.logDir();
  }
  async logDir(){
    
  }
  
  // testForm: FormModel = {
  //   name: "test",
  //   fields: [{
  //     name: "someNumber",
  //     type: "number"
  //   },
  // {name: "someText",
  //   type: "text"
  // }]
  // }

}
