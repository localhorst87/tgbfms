import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

import { AppdataAccessService } from './Dataaccess/appdata-access.service';
import { AppdataAccessFirestoreService } from './Dataaccess/appdata-access-firestore.service';
import { MatchdataAccessService } from './Dataaccess/matchdata-access.service';
import { MatchdataAccessOpenligaService } from './Dataaccess/matchdata-access-openliga.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    AngularFirestoreModule
  ],
  providers: [
    { provide: AppdataAccessService, useClass: AppdataAccessFirestoreService },
    { provide: MatchdataAccessService, useClass: MatchdataAccessOpenligaService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
