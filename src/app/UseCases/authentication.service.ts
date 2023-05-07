import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { User } from '../Businessrules/basic_datastructures';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private fireAuth: AngularFireAuth,
    private appData: AppdataAccessService,
    private router: Router,
    private ngZone: NgZone,
    private snackbar: MatSnackBar) { }

  public signUp(email: string, displayName: string, password: string): Promise<any> {
    // registers a user

    return this.fireAuth.createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        if (userCredential.user) {

          userCredential.user.updateProfile({ displayName: displayName });
          userCredential.user.sendEmailVerification();

          let newUser: User = {
            documentId: this.appData.createDocumentId(),
            id: userCredential.user.uid,
            email: email,
            displayName: displayName,
            isAdmin: false,
            isActive: false, // will be set to true after email verification
            configs: {
              theme: "light",
              notificationLevel: 0,
              notificationTime: 1
            }
          };
          this.appData.setUser(newUser);

          // enter the protected zone
          this.ngZone.run(() => {
            this.router.navigate(["main"]);
          });
        }
      })
      .catch(
        err => {
          let snackbarMsg: string;
          if (err.code == "auth/email-already-in-use") {
            snackbarMsg = "E-Mail-Adresse existiert schon";
          }
          else if (err.code == "auth/weak-password") {
            snackbarMsg = "Passwort zu schwach";
          }
          else {
            snackbarMsg = err.message;
          }
          this.snackbar.open(snackbarMsg, "OK");
        }
      );
  }

  public sendResetMail(email: string): Promise<any> {
    // sends a mail to reset the password

    return this.fireAuth.sendPasswordResetEmail(email)
      .then(() => {
        let snackbarMsg: string = "E-Mail versendet. Bitte überprüfe dein Postfach.";
        let confirmMsg: string = "OK";
        this.snackbar.open(snackbarMsg, confirmMsg);
      })
      .catch(
        err => {
          let snackbarMsg: string;
          let confirmMsg: string;

          if (err.code == "auth/user-not-found") {
            snackbarMsg = "Unbekannte E-Mail-Adresse";
            confirmMsg = "OK";
            this.snackbar.open(snackbarMsg, confirmMsg);
          }
          else {
            snackbarMsg = err.message;
            confirmMsg = "OK";
            this.snackbar.open(snackbarMsg, confirmMsg);
          }
        }
      );
  }

  public login(email: string, password: string): Promise<any> {
    // login user and perform sync of activation status

    return this.fireAuth.signInWithEmailAndPassword(email, password)
      .then(userCredential => {
        if (userCredential.user) {

          // check and sync activation status of account
          this.appData.getUserDataById$(userCredential.user.uid).subscribe(
            (userFromApp: User) => {
              if (userCredential.user) {
                if (userFromApp.isActive != userCredential.user.emailVerified) {
                  userFromApp.isActive = userCredential.user.emailVerified;
                  this.appData.setUser(userFromApp);
                }
              }
            }
          );

          // enter the protected zone
          this.ngZone.run(() => {
            this.router.navigate(["main"]);
          });
        }
      })
      .catch(
        err => {
          let snackbarMsg: string;
          let confirmMsg: string;

          if (err.code == "auth/user-not-found") {
            snackbarMsg = "Unbekannte E-Mail-Adresse";
            confirmMsg = "OK";
            this.snackbar.open(snackbarMsg, confirmMsg);
          }
          else if (err.code == "auth/wrong-password") {
            snackbarMsg = "Falsches Passwort";
            confirmMsg = "Passwort vergessen?";
            this.snackbar.open(snackbarMsg, confirmMsg, { duration: 5000 })
              .onAction()
              .subscribe(() => this.router.navigateByUrl('/pw-reset'));
          }
          else {
            snackbarMsg = err.message;
            confirmMsg = "OK";
            this.snackbar.open(snackbarMsg, confirmMsg);
          }
        }
      );
  }

  public logout(): Promise<void> {
    // logout the current user

    return this.fireAuth.signOut().then(
      () => { this.router.navigate(["login"]); }
    );
  }

  public getLoggedUser$(): Observable<any> {
    // returns the Observable for the currently logged in user

    return this.fireAuth.user;
  }
}
