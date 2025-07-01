import { Component } from '@angular/core';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import { RegistryModel } from '../common/models/registry.model';
import { PluginModel } from '../common/models/plugin.model';
import { RegistryNodeModel } from '../common/models/registry-node.model';
import { NestedTreeControl } from '@angular/cdk/tree';
import {MatButtonModule} from '@angular/material/button';
@Component({
  selector: 'app-plugin-registry',
  standalone: true,
  imports: [MatTreeModule, MatIconModule, MatButtonModule],
  templateUrl: './plugin-registry.component.html',
  styleUrl: './plugin-registry.component.scss'
})
export class PluginRegistryComponent {
  registry: RegistryModel;
  get registryDataSource(): PluginModel[]{
    return this.registry.plugins;
  }
  hasChild = (_: number, node: RegistryNodeModel<any>) => !!node.children && node.children.length > 0;
  treeControl = new NestedTreeControl<RegistryNodeModel<any>>(node => node.children)
  
  constructor() {
    this.registry = REGISTRY_EXAMPLE;
  }

}

const REGISTRY_EXAMPLE = {
      plugins: [
        {
          name: "hello",
          modules: [
            {
              name: "world",
              forms: [
                {
                  name: "temp1",
                  fields: []
                }
              ],
              get children(){
                return this.forms;
              }
            }
            
          ],
          get children(){
            return this.modules;
          }
          ,
          description: ""
        },
        {
          name: "hello",
          modules: [
            {
              name: "world",
              forms: [],
            }
          ],
          get children(){
            return this.modules;
          },
          description: ""
        }
      ]
    }