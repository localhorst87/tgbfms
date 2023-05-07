import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { of } from 'rxjs';
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';
import { User } from '../Businessrules/basic_datastructures';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let appDataSpy: jasmine.SpyObj<AppdataAccessService>;
  let fireAuthSpy: jasmine.SpyObj<AngularFireAuth>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackbarSpy: jasmine.SpyObj<MatSnackBar>

  beforeEach(() => {
    appDataSpy = jasmine.createSpyObj([
      "setUser",
      "getUserDataById$",
      "createDocumentId"
    ]);
    fireAuthSpy = jasmine.createSpyObj([
      "createUserWithEmailAndPassword",
      "sendPasswordResetEmail",
      "signInWithEmailAndPassword",
      "signOut"
    ]);
    routerSpy = jasmine.createSpyObj(["navigate"]);
    snackbarSpy = jasmine.createSpyObj(["open"])

    TestBed.configureTestingModule({
      providers: [
        AuthenticationService,
        { provide: AppdataAccessService, useValue: appDataSpy },
        { provide: AngularFireAuth, useValue: fireAuthSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackbarSpy }
      ]
    });
    service = TestBed.inject(AuthenticationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // signUp
  // ---------------------------------------------------------------------------

  it('signUp successful', async () => {
    const email: string = "test@email.com";
    const displayName: string = "Testuser";
    const password: string = "fj80$540hs/";

    const userStub: any = { uid: "test_uid", updateProfile: jasmine.createSpy("updateProfile").and.stub(), sendEmailVerification: jasmine.createSpy("sendEmailVerification").and.stub() };
    const userCredential: any = { user: userStub };
    fireAuthSpy.createUserWithEmailAndPassword.and.resolveTo(userCredential);

    appDataSpy.setUser.and.stub();
    appDataSpy.createDocumentId.and.returnValue("test_id");
    routerSpy.navigate.and.stub();

    await expectAsync(service.signUp(email, displayName, password)).toBeResolved()
      .then(() => {
        expect(routerSpy.navigate).toHaveBeenCalled();
      });
  });

  it('signUp fails, reject with email already in use', async () => {
    const email: string = "test@email.com";
    const displayName: string = "Testuser";
    const password: string = "fj80$540hs/";

    const err: any = {
      code: "auth/email-already-in-use",
      message: "Thrown if there already exists an account with the given email address."
    };

    fireAuthSpy.createUserWithEmailAndPassword.and.rejectWith(err);
    snackbarSpy.open.and.stub();

    const expectedSnackbarMsg: string = "E-Mail-Adresse existiert schon";
    const expectedSnackbarCnfm: string = "OK";

    await expectAsync(service.signUp(email, displayName, password)).toBeResolved()
      .then(() => {
        expect(snackbarSpy.open).toHaveBeenCalledWith(expectedSnackbarMsg, expectedSnackbarCnfm);
      });
  });

  it('signUp fails, reject with password too weak', async () => {
    const email: string = "test@email.com";
    const displayName: string = "Testuser";
    const password: string = "fj80$540hs/";

    const err: any = {
      code: "auth/weak-password",
      message: "Thrown if the password is not strong enough."
    };

    fireAuthSpy.createUserWithEmailAndPassword.and.rejectWith(err);
    snackbarSpy.open.and.stub();

    const expectedSnackbarMsg: string = "Passwort zu schwach";
    const expectedSnackbarCnfm: string = "OK";

    await expectAsync(service.signUp(email, displayName, password)).toBeResolved()
      .then(() => {
        expect(snackbarSpy.open).toHaveBeenCalledWith(expectedSnackbarMsg, expectedSnackbarCnfm);
      });
  });

  it('signUp fails due to other reason', async () => {
    const email: string = "test@email.com";
    const displayName: string = "Testuser";
    const password: string = "fj80$540hs/";

    const err: any = {
      code: "auth/operation-not-allowed",
      message: "email/password accounts are not enabled"
    };

    fireAuthSpy.createUserWithEmailAndPassword.and.rejectWith(err);
    snackbarSpy.open.and.stub();

    const expectedSnackbarMsg: string = err.message;
    const expectedSnackbarCnfm: string = "OK";

    await expectAsync(service.signUp(email, displayName, password)).toBeResolved()
      .then(() => {
        expect(snackbarSpy.open).toHaveBeenCalledWith(expectedSnackbarMsg, expectedSnackbarCnfm);
      });
  });

  // ---------------------------------------------------------------------------
  // sendResetMail
  // ---------------------------------------------------------------------------

  it('password reset successful', async () => {
    const email: string = "test@email.com";

    fireAuthSpy.sendPasswordResetEmail.and.resolveTo();
    snackbarSpy.open.and.stub();

    const expectedSnackbarMsg = "E-Mail versendet. Bitte überprüfe dein Postfach.";
    const expectedSnackbarCnfm: string = "OK"

    await expectAsync(service.sendResetMail(email)).toBeResolved()
      .then(() => {
        expect(snackbarSpy.open).toHaveBeenCalledWith(expectedSnackbarMsg, expectedSnackbarCnfm);
      });
  });

  it('password reset fails, reject with user not found', async () => {
    const email: string = "test@email.com";

    const err: any = {
      code: "auth/user-not-found",
      message: "Thrown if there is no user corresponding to the email address."
    };

    fireAuthSpy.sendPasswordResetEmail.and.rejectWith(err);
    snackbarSpy.open.and.stub();

    const expectedSnackbarMsg: string = "Unbekannte E-Mail-Adresse";
    const expectedSnackbarCnfm: string = "OK";

    await expectAsync(service.sendResetMail(email)).toBeResolved()
      .then(() => {
        expect(snackbarSpy.open).toHaveBeenCalledWith(expectedSnackbarMsg, expectedSnackbarCnfm);
      });
  });

  it('passwort reset fails, reject with other reason', async () => {
    const email: string = "test@email.com";

    const err: any = {
      code: "auth/invalid-email",
      message: "Thrown if the email address is not valid."
    };

    fireAuthSpy.sendPasswordResetEmail.and.rejectWith(err);
    snackbarSpy.open.and.stub();

    const expectedSnackbarMsg: string = err.message;
    const expectedSnackbarCnfm: string = "OK";

    await expectAsync(service.sendResetMail(email)).toBeResolved()
      .then(() => {
        expect(snackbarSpy.open).toHaveBeenCalledWith(expectedSnackbarMsg, expectedSnackbarCnfm);
      });
  });

  // ---------------------------------------------------------------------------
  // login
  // ---------------------------------------------------------------------------

  it('login successful, verification status up to date', async () => {
    const email: string = "test@email.com";
    const password: string = "fj80$540hs/";

    const userStub: any = { emailVerified: true, updateProfile: jasmine.createSpy("updateProfile").and.stub(), sendEmailVerification: jasmine.createSpy("sendEmailVerification").and.stub() };
    const userCredential: any = { user: userStub };
    fireAuthSpy.signInWithEmailAndPassword.and.resolveTo(userCredential);

    const userFromApp: User = {
      documentId: "doc_id",
      id: "user_id",
      email: email,
      displayName: "test_user",
      isAdmin: false,
      isActive: true,
      configs: {
        theme: "light",
        notificationLevel: 0,
        notificationTime: 1
      }
    };

    appDataSpy.getUserDataById$.and.returnValue(of(userFromApp));
    appDataSpy.setUser.and.stub();
    routerSpy.navigate.and.stub();

    await expectAsync(service.login(email, password)).toBeResolved()
      .then(() => {
        expect(appDataSpy.setUser).not.toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalled();
      });
  });

  it('login successful, verification status needs sync', async () => {
    const email: string = "test@email.com";
    const password: string = "fj80$540hs/";

    const userStub: any = { emailVerified: true, updateProfile: jasmine.createSpy("updateProfile").and.stub(), sendEmailVerification: jasmine.createSpy("sendEmailVerification").and.stub() };
    const userCredential: any = { user: userStub };
    fireAuthSpy.signInWithEmailAndPassword.and.resolveTo(userCredential);

    const userFromApp: User = {
      documentId: "doc_id",
      id: "user_id",
      email: email,
      displayName: "test_user",
      isAdmin: false,
      isActive: false,
      configs: {
        theme: "light",
        notificationLevel: 0,
        notificationTime: 1
      }
    };

    appDataSpy.getUserDataById$.and.returnValue(of(userFromApp));
    appDataSpy.setUser.and.stub();
    routerSpy.navigate.and.stub();

    await expectAsync(service.login(email, password)).toBeResolved()
      .then(() => {
        expect(appDataSpy.setUser).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalled();
      });
  });

  it('login fails, reject with user not found', async () => {
    const email: string = "test@email.com";
    const displayName: string = "Testuser";
    const password: string = "fj80$540hs/";

    const err: any = {
      code: "auth/user-not-found",
      message: "Thrown if there is no user corresponding to the given email."
    };

    fireAuthSpy.signInWithEmailAndPassword.and.rejectWith(err);
    snackbarSpy.open.and.stub();

    const expectedSnackbarMsg: string = "Unbekannte E-Mail-Adresse";
    const expectedSnackbarCnfm: string = "OK";

    await expectAsync(service.login(email, password)).toBeResolved()
      .then(() => {
        expect(snackbarSpy.open).toHaveBeenCalledWith(expectedSnackbarMsg, expectedSnackbarCnfm);
      });
  });

  it('login fails, reject with wrong passwort', async () => {
    const email: string = "test@email.com";
    const displayName: string = "Testuser";
    const password: string = "fj80$540hs/";

    const err: any = {
      code: "auth/wrong-password",
      message: "Thrown if the password is invalid for the given email, or the account corresponding to the email does not have a password set."
    };

    fireAuthSpy.signInWithEmailAndPassword.and.rejectWith(err);
    const onActionObsSpy: any = { subscribe: () => { } }
    const snackBarRefSpy: any = { onAction: jasmine.createSpy("onAction").and.returnValue(onActionObsSpy) }
    snackbarSpy.open.and.returnValue(snackBarRefSpy);

    const expectedSnackbarMsg: string = "Falsches Passwort";
    const expectedSnackbarCnfm: string = "Passwort vergessen?";
    const expectedSnackbarOption: any = { duration: 5000 };

    await expectAsync(service.login(email, password)).toBeResolved()
      .then(() => {
        expect(snackbarSpy.open).toHaveBeenCalledWith(expectedSnackbarMsg, expectedSnackbarCnfm, expectedSnackbarOption);
      });
  });

  it('login fails, reject with other reason', async () => {
    const email: string = "test@email.com";
    const displayName: string = "Testuser";
    const password: string = "fj80$540hs/";

    const err: any = {
      code: "auth/user-disabled",
      message: "Thrown if the user corresponding to the given email has been disabled."
    };

    fireAuthSpy.signInWithEmailAndPassword.and.rejectWith(err);
    snackbarSpy.open.and.stub();

    const expectedSnackbarMsg: string = err.message
    const expectedSnackbarCnfm: string = "OK";

    await expectAsync(service.login(email, password)).toBeResolved()
      .then(() => {
        expect(snackbarSpy.open).toHaveBeenCalledWith(expectedSnackbarMsg, expectedSnackbarCnfm);
      });
  });

});
