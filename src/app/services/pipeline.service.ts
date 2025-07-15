import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { PipelineModel } from "../common/models/pipeline/pipeline.model";

@Injectable({
    providedIn: "root"
})
export class PipelineService {

    
    private pipelineSubject: BehaviorSubject<PipelineModel | undefined>;
    constructor() {
        this.pipelineSubject = new BehaviorSubject<PipelineModel | undefined>(undefined);
    }
    get activePipeline() {
        return this.pipelineSubject.asObservable();
    }
    setActivePipeline(form: PipelineModel) {
        this.pipelineSubject.next(form);
    }
}