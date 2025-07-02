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