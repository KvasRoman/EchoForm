import { RouterModule, Routes } from "@angular/router";
import { PluginRegistryComponent } from "../plugin-registry/plugin-registry.component";
import { FormComponent } from "../form/form.component";
import { NgModule } from "@angular/core";

export const MainRoutes: Routes = [
    {path: '', redirectTo: 'registry', pathMatch: 'full'},
  { path: 'registry', component: PluginRegistryComponent },
  { path: 'form', component: FormComponent}
//   { path: '**', component: NotFound }
];
