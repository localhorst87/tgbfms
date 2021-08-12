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

  ngOnInit() {
    let synctimer: any = interval(1000).subscribe(
      (i: number) => {
        let matchday: number = i + 1;
        this.syncService.syncData(2021, matchday);
        if (matchday == 34) {
          synctimer.unsubscribe();
        }
      }
    );
  }
}
