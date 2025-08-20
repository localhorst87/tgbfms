import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import firebase from 'firebase/compat/app';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { AuthenticationService } from '../UseCases/authentication.service';
import { User } from '../Businessrules/basic_datastructures';
import { CurrentMatchdays } from '../Dataaccess/import_datastructures';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  selectedPage: string;
  loggedUser: User;
  matchdayNextMatch: number;
  matchdayLastMatch: number;
  matchdayCompleted: number;
  matchdayCurrent: number;
  matchdayClosestMatch: number;
  matchdayUserSelection: number;
  matchdaysToSync: number[];
  applyDarkTheme: FormControl;

  constructor(
    private appData: AppdataAccessService,
    private functions: AngularFireFunctions,
    private authenticator: AuthenticationService,
    private renderer: Renderer2,
    private formBuilder: FormBuilder) {

    this.loggedUser = {
      documentId: "",
      id: "",
      displayName: "",
      isAdmin: false,
      isActive: false,
      configs: {
        theme: "light",
        notificationLevel: 0,
        notificationTime: 1
      }
    };

    this.selectedPage = "dashboard";
    this.matchdayNextMatch = -1;
    this.matchdayLastMatch = -1;
    this.matchdayClosestMatch = -1;
    this.matchdayCompleted = -1;
    this.matchdayCurrent = -1;
    this.matchdayUserSelection = -1;
    this.matchdaysToSync = [];
    this.applyDarkTheme = this.formBuilder.control(false);
  }

  switchTheme(): void {
    if (this.applyDarkTheme.value) {
      this.renderer.addClass(document.body, 'theme-dark');
    }
    else {
      this.renderer.removeClass(document.body, 'theme-dark');
    }
  }

  changeView(targetPage: string): void {
    this.selectedPage = targetPage;
  }

  changeMatchdayOnUserSelection(matchday: number): void {
    this.matchdayUserSelection = matchday;
  }

  updateUser(user: User): void {
    this.loggedUser = user;
  }

  logout(): void {
    this.authenticator.logout();
  }

  setMatchdays(): void {
    const callable = this.functions.httpsCallable('getCurrentMatchdays2ndGen');
    callable({}).subscribe(
      (currentMatchdays: CurrentMatchdays) => {
        this.matchdayLastMatch = currentMatchdays.matchdayLastMatch;
        this.matchdayNextMatch = currentMatchdays.matchdayNextMatch;
        this.matchdayClosestMatch = currentMatchdays.matchdayClosest;
        this.matchdayCurrent = currentMatchdays.matchdayRecent;
        this.matchdayCompleted = currentMatchdays.matchdayCompleted;
      }
    );
  }

  ngOnInit(): void {

    // set logged user as property
    this.authenticator.getLoggedUser$().subscribe(
      (user: firebase.User | null) => {
        if (user) {
          this.appData.getUserDataById$(user.uid).subscribe(
            (userProfile: User) => {
              this.loggedUser = userProfile;
              this.loggedUser.isActive = user.emailVerified;
              // switch to default theme from user config
              this.applyDarkTheme.setValue(this.loggedUser.configs.theme == "dark");
              this.switchTheme();
            }
          );
        }
      }
    );

    this.setMatchdays();
  }
}
