import { Injectable } from "@angular/core";
import { RegistryModel } from "../common/models/registry.model";
import { RegistryNodeModel } from "../common/models/registry-node.model";

@Injectable({providedIn:"root"})
export default class TreeService {
    getBranch(registry: RegistryModel, node: RegistryNodeModel<unknown>): RegistryNodeModel<unknown>[] | null {
        let res: any[] | null = [];
        const plugins = registry.plugins || [];
        for(const plugin of plugins){
            let path: RegistryNodeModel<unknown>[] = [];
            res = this.findPath(plugin, node, path);
            if(res) return res;
        }
        return null;
    }
    getBranchById(registry: RegistryModel, nodeId: string): RegistryNodeModel<unknown>[] | null {
        let res: any[] | null = [];
        const plugins = registry.plugins || [];
        for(const plugin of plugins){
            let path: RegistryNodeModel<unknown>[] = [];
            res = this.findPathByID(plugin, nodeId, path);
            if(res) return res;
        }
        return null;
    }
    getBranchElements(registry: RegistryModel, branch: string[]): RegistryNodeModel<unknown>[] | null{
        const plugin = registry.plugins.find(plugin => plugin.name == branch[0]);
        if(!plugin) return null;
        const module = plugin?.modules.find(module => module.name == branch[1]);
        if(!module) return null;
        const form = module?.forms.find(form => form.name == branch[2]);
        if(!form) return null;
        
        return [plugin, module, form];
    }
    
    private findPathByID(node: RegistryNodeModel<any>, target: string, path: RegistryNodeModel<unknown>[]): RegistryNodeModel<unknown>[] | null {
        if (!node) return null;

        path.push(node);

        if (node.id === target) {
            return [...path];
        }

        if (node.children) {
            for (const child of node.children) {
                const result = this.findPathByID(child, target, path);
                if (result) {
                    return result;
                }
            }
        }
        
        return null;
    }
    private findPath(node: RegistryNodeModel<any>, target: RegistryNodeModel<unknown>, path: RegistryNodeModel<unknown>[]): RegistryNodeModel<unknown>[] | null {
        if (!node) return null;

        path.push(node);

        if (node.id === target.id) {
            return [...path];
        }

        if (node.children) {
            for (const child of node.children) {
                const result = this.findPath(child, target, path);
                if (result) {
                    return result;
                }
            }
        }
        
        return null;
    }
}