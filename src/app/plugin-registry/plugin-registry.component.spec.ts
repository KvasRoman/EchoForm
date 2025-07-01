import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PluginRegistryComponent } from './plugin-registry.component';

describe('PluginRegistryComponent', () => {
  let component: PluginRegistryComponent;
  let fixture: ComponentFixture<PluginRegistryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PluginRegistryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PluginRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
