import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import '@angular/common/locales/global/de';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

import { AppdataAccessService } from './Dataaccess/appdata-access.service';
import { AppdataAccessFirestoreService } from './Dataaccess/appdata-access-firestore.service';
import { MatchdataAccessService } from './Dataaccess/matchdata-access.service';
import { MatchdataAccessOpenligaService } from './Dataaccess/matchdata-access-openliga.service';
import { PointCalculatorService } from './Businessrules/point-calculator.service';
import { PointCalculatorTrendbasedService } from './Businessrules/point-calculator-trendbased.service';
import { StatisticsCalculatorService } from './Businessrules/statistics-calculator.service';
import { StatisticsCalculatorTrendbasedService } from './Businessrules/statistics-calculator-trendbased.service';
import { BetWriteComponent } from './bet-write/bet-write.component';
import { HomeComponent } from './home/home.component';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [
    AppComponent,
    BetWriteComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAnalyticsModule,
    AngularFirestoreModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatRadioModule,
    MatSliderModule,
    MatExpansionModule,
    MatSelectModule,
    MatSidenavModule,
    MatToolbarModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de' },
    { provide: AppdataAccessService, useClass: AppdataAccessFirestoreService },
    { provide: MatchdataAccessService, useClass: MatchdataAccessOpenligaService },
    { provide: PointCalculatorService, useClass: PointCalculatorTrendbasedService },
    { provide: StatisticsCalculatorService, useClass: StatisticsCalculatorTrendbasedService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
