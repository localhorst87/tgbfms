import { Component, Input, OnInit } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../Businessrules/basic_datastructures';
import { SimpleResult } from '../Dataaccess/import_datastructures';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';

const PW_MIN_LENGTH: number = 6;

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @Input() user: User;

  email: FormControl;
  emailRepeat: FormControl;
  password: FormControl;
  passwordRepeat: FormControl;
  hidePassword: boolean;
  username: FormControl;

  constructor(
    private functions: AngularFireFunctions,
    private snackbar: MatSnackBar,
    private appdata: AppdataAccessService) {
    
    this.user = {
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

    this.email = new FormControl("", [Validators.required, Validators.email]);
    this.emailRepeat = new FormControl("", [Validators.required, Validators.email]);

    this.password = new FormControl("", [Validators.required, Validators.minLength(PW_MIN_LENGTH)]);
    this.passwordRepeat = new FormControl("", [Validators.required, Validators.minLength(PW_MIN_LENGTH)]);
    this.hidePassword = true;

    this.username = new FormControl("");
  }

  changeEmail(): void {
    const callable = this.functions.httpsCallable('changeEmail');
    callable({ userId: this.user.id, newEmail: this.email.value }).subscribe(
      (result: SimpleResult) => {
        if (result.operationSuccessful === true) {
          let snackbarMsg: string = "Email zur Bestätigung an deine neue Email versendet.";
          let confirmMsg: string = "OK";
          this.snackbar.open(snackbarMsg, confirmMsg);
        }
        else {
          let snackbarMsg: string = "Da ist was schief gelaufen. Versuche es später nochmal...";
          let confirmMsg: string = "OK";
          this.snackbar.open(snackbarMsg, confirmMsg);
        }
      }
    );
  }

  changePassword(): void {
    const callable = this.functions.httpsCallable('changePassword');
    callable({ userId: this.user.id, newPassword: this.password.value }).subscribe(
      (result: SimpleResult) => {
        if (result.operationSuccessful === true) {
          let snackbarMsg: string = "Passwort wurde geändert.";
          let confirmMsg: string = "OK";
          this.snackbar.open(snackbarMsg, confirmMsg);
        }
        else {
          let snackbarMsg: string = "Da ist was schief gelaufen. Versuche es später nochmal...";
          let confirmMsg: string = "OK";
          this.snackbar.open(snackbarMsg, confirmMsg);
        }
      }
    )
  }

  changeUsername(): void {
    const callable = this.functions.httpsCallable('changeUsername');
    callable({ oldUsername: this.user.displayName, newUsername: this.username.value }).subscribe(
      (result: SimpleResult) => {
        if (result.operationSuccessful === true) {
          let snackbarMsg: string = "Anforderung zur Änderung wurde gesendet";
          let confirmMsg: string = "OK";
          this.snackbar.open(snackbarMsg, confirmMsg);
        }
        else {
          let snackbarMsg: string = "Da ist was schief gelaufen. Versuche es später nochmal...";
          let confirmMsg: string = "OK";
          this.snackbar.open(snackbarMsg, confirmMsg);
        }
      }
    )
  }

  getEmailErrorMessage(emailFormControl: FormControl): string {
    if (emailFormControl.hasError("required")) {
      return "Email darf nicht leer sein!";
    }

    return emailFormControl.hasError("email") ? "ungültiges Emailformat" : "";
  }

  getPasswordErrorMessage(passwordFormControl: FormControl): string {
    if (passwordFormControl.hasError("required")) {
      return "Neues Passwort darf nicht leer sein"
    }

    return passwordFormControl.hasError("minlength") ? "Mindestens " + PW_MIN_LENGTH + " Zeichen!" : "";
  }

  checkEmailChangePreconditions(): boolean {
    return this.email.hasError("required") === false &&
      this.email.hasError("email") === false &&
      this.emailRepeat.hasError("required") === false &&
      this.emailRepeat.hasError("email") === false &&
      this.email.value === this.emailRepeat.value;
  }

  checkPasswordChangePreconditions(): boolean {
    return this.password.hasError("required") === false &&
    this.password.hasError("minLength") === false &&
    this.passwordRepeat.hasError("required") === false &&
    this.passwordRepeat.hasError("minLength") === false &&
    this.password.value === this.passwordRepeat.value;
  }


  ngOnInit(): void {
  }

}
