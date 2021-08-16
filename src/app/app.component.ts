import { Component } from '@angular/core';
import { SynchronizeDataService } from './UseCases/synchronize-data.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private syncService: SynchronizeDataService) { }

  ngOnInit() { }
}
