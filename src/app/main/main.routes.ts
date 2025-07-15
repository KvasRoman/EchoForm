import { RouterModule, Routes } from "@angular/router";
import { RegistryComponent } from "../registry/registry.component";
import { FormComponent } from "../form/form.component";
import { NgModule } from "@angular/core";
import { PipelineReaderComponent } from "../pipeline/reader/reader.component";

export const MainRoutes: Routes = [
    {path: '', redirectTo: 'registry', pathMatch: 'full'},
  { path: 'registry', component: RegistryComponent },
  { path: 'form', component: FormComponent},
  {path: 'pipeline', children: [{
    path: 'reader', component: PipelineReaderComponent
  }]}
//   { path: '**', component: NotFound }
];
