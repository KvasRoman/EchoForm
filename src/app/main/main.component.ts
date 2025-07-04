import { Component, inject, OnInit } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { FormModel } from '../common/models/form.model';

import { open } from "@tauri-apps/plugin-dialog"
import { CommandService } from '../services/command.service';
import { PluginRegistryComponent } from '../plugin-registry/plugin-registry.component';
import { RouterModule, RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit {
  private commandService = inject(CommandService);
  
  ngOnInit(): void {
  }

}
