import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PipelineReaderComponent } from './reader.component';

describe('ReaderComponent', () => {
  let component: PipelineReaderComponent;
  let fixture: ComponentFixture<PipelineReaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PipelineReaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PipelineReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
