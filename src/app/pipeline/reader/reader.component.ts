import { Component } from '@angular/core';
import { PipelineModel } from '../../common/models/pipeline/pipeline.model';
import { FieldModel } from '../../common/models/field.model';
import { FileInputComponent } from '../../common/file/file.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reader',
  standalone: true,
  imports: [FileInputComponent,ReactiveFormsModule],
  templateUrl: './reader.component.html',
  styleUrl: './reader.component.css'
})
export class PipelineReaderComponent {
  pipeline: PipelineModel;

  getFormFields(formId: string): FieldModel[]{
    return []
  }
}
