import { Component, OnInit } from '@angular/core';
import RegistryService from '../services/registry.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  /**
   *
   */
  constructor(private registryService: RegistryService) {
      registryService.loadPlugins();
  }

  ngOnInit(): void {

  }
}
