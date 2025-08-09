import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, shareReplay } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CommonValueService {
  private registry = new Map<string, BehaviorSubject<unknown>>();

  ensure(key: string, initial?: unknown) {
    if (!this.registry.has(key)) {
      this.registry.set(key, new BehaviorSubject<unknown>(initial));
    }
    return this.registry.get(key)!;
  }

  get$(key: string) {
    return this.ensure(key).asObservable().pipe(distinctUntilChanged(), shareReplay(1));
  }

  peek(key: string) {
    return this.ensure(key).getValue();
  }

  set(key: string, value: unknown) {
    this.ensure(key).next(value);
  }

  /** (Optional) expose keys if you want to snapshot all common values */
  keys(): string[] {
    return Array.from(this.registry.keys());
  }
}
