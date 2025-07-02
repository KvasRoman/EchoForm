import { Component } from '@angular/core';
import {MatTreeModule} from '@angular/material/tree';
import {MatIconModule} from '@angular/material/icon';
import { RegistryModel } from '../common/models/registry.model';
import { PluginModel } from '../common/models/plugin.model';
import { RegistryNodeModel } from '../common/models/registry-node.model';
import { NestedTreeControl } from '@angular/cdk/tree';
import {MatButtonModule} from '@angular/material/button';
import TreeService from '../services/tree.service';
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
  
  onLeafClick($event: any,node: RegistryNodeModel<any>){
    event?.preventDefault();
    event?.stopPropagation();
    let branch = this.treeService.getBranch(this.registry, node);
    console.log("branch", branch);
  }
  constructor(private treeService: TreeService) {
    this.registry = REGISTRY_EXAMPLE;
  }

}

const REGISTRY_EXAMPLE: RegistryModel = {
      plugins: [
        {
          id: "hello1",
          name: "hello",
          modules: [
            {
              id: "world1",
              name: "world",
              forms: [
                {
                  id: "temp1",
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
          id: "hello2",
          name: "hello",
          modules: [
            {
              id: "world2",
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