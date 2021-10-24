import { NgModule, Injectable, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpInterceptor, HttpRequest, HttpHandler, HTTP_INTERCEPTORS } from '@angular/common/http';
import '@angular/common/locales/global/de';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAnalyticsModule } from '@angular/fire/compat/analytics';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
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
import { BetOverviewComponent } from './bet-overview/bet-overview.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { SyncDialogComponent } from './sync-dialog/sync-dialog.component';
import { DashboardComponent } from './dashboard/dashboard.component';

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
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableComponent } from './table/table.component';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';

// Other UI components
import { SwiperModule } from 'swiper/angular';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Injectable()
export class NoCacheHeadersInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authReq = req.clone({
      setHeaders: {
        "Cache-Control": "no-cache",
        "Pragma": "no-cache"
      }
    });
    return next.handle(authReq);
  }
}

@NgModule({
  declarations: [
    AppComponent,
    BetWriteComponent,
    HomeComponent,
    BetOverviewComponent,
    TableComponent,
    LoginComponent,
    RegisterComponent,
    SyncDialogComponent,
    DashboardComponent
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
    MatToolbarModule,
    MatTabsModule,
    MatCardModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatDialogModule,
    MatGridListModule,
    MatTooltipModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatSortModule,
    SwiperModule,
    NgxChartsModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de' },
    { provide: HTTP_INTERCEPTORS, useClass: NoCacheHeadersInterceptor, multi: true },
    { provide: AppdataAccessService, useClass: AppdataAccessFirestoreService },
    { provide: MatchdataAccessService, useClass: MatchdataAccessOpenligaService },
    { provide: PointCalculatorService, useClass: PointCalculatorTrendbasedService },
    { provide: StatisticsCalculatorService, useClass: StatisticsCalculatorTrendbasedService }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
