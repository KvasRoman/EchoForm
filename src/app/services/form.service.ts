import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { FormModel } from "../common/models/form.model";
import { RegistryNodeModel } from "../common/models/registry-node.model";

@Injectable({providedIn: 'root'})
export class FormService{

    private formSubject: BehaviorSubject<FormModel | null>
    private branchSubject: BehaviorSubject<RegistryNodeModel<unknown>[]>

    constructor() {
        this.formSubject = new BehaviorSubject<FormModel | null>(null);
        this.branchSubject = new BehaviorSubject<RegistryNodeModel<unknown>[]>([]);        
    }
    get activeFrom(){
        return this.formSubject.asObservable();
    }
    get activeBranch(){
        return this.branchSubject.asObservable();
    }
    setActiveForm(form: FormModel){
        this.formSubject.next(form);
    }
    setActiveBranch(branch: RegistryNodeModel<unknown>[]){
        this.branchSubject.next(branch);
    }
}