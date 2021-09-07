import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from "@angular/router";
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
    private ngZone: NgZone) { }

  public signUp(email: string, displayName: string, password: string): any {
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
          };
          this.appData.setUser(newUser);

          // enter the protected zone
          this.ngZone.run(() => {
            this.router.navigate(["main"]);
          });
        }
      })
      .catch(
        err => { }
      );
  }

  public login(email: string, password: string): any {
    // login user and perform sync of activation status

    return this.fireAuth.signInWithEmailAndPassword(email, password).then(
      userCredential => {
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
      });
  }

  public logout(): any {
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
