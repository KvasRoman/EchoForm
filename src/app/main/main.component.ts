import { Component } from '@angular/core';
import { FormComponent } from '../form/form.component';
import { FormModel } from '../form/form.model';


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [FormComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  testForm: FormModel = {
    name: "test",
    fields: [{
      name: "someNumber",
      type: "number"
    },
  {name: "someText",
    type: "text"
  }]
  }
}
