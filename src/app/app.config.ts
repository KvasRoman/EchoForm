import { ApplicationConfig } from "@angular/core";
import { provideRouter } from "@angular/router";

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MainRoutes } from "./main/main.routes";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(MainRoutes),provideAnimationsAsync('noop')],
};
