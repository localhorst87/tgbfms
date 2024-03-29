import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import '@angular/common/locales/global/de';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAnalyticsModule } from '@angular/fire/compat/analytics';
import { AngularFirestoreModule, SETTINGS } from '@angular/fire/compat/firestore';
import { AngularFireFunctionsModule, REGION } from '@angular/fire/compat/functions';
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
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RulesComponent } from './rules/rules.component';

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
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Other UI components
import { SwiperModule } from 'swiper/angular';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ConfigComponent } from './config/config.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    BetWriteComponent,
    HomeComponent,
    BetOverviewComponent,
    TableComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    PasswordResetComponent,
    RulesComponent,
    ConfigComponent,
    StatisticsComponent,
    UserProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireFunctionsModule,
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
    MatMenuModule,
    MatCheckboxModule,
    SwiperModule,
    NgxChartsModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de' },
    { provide: REGION, useValue: 'europe-west3'},
    { provide: AppdataAccessService, useClass: AppdataAccessFirestoreService },
    { provide: MatchdataAccessService, useClass: MatchdataAccessOpenligaService },
    { provide: PointCalculatorService, useClass: PointCalculatorTrendbasedService },
    { provide: StatisticsCalculatorService, useClass: StatisticsCalculatorTrendbasedService },
    // {
    //   provide: SETTINGS,
    //   useValue: environment.emulator === true ? {
    //     host: 'localhost:8080',
    //     ssl: false
    //   } : undefined
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
