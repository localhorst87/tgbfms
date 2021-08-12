import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '../UseCases/authentication.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  email: FormControl;
  displayName: FormControl;
  password: FormControl;
  passwordRepeat: FormControl;
  hidePassword: boolean;
  registrationRequested: boolean;

  constructor(private authenticator: AuthenticationService) {
    this.email = new FormControl("", [Validators.required, Validators.email]);
    this.displayName = new FormControl("", [Validators.required, Validators.pattern("[A-Za-z]+")]);
    this.password = new FormControl("", [Validators.required, Validators.minLength(6)]);
    this.passwordRepeat = new FormControl("", [Validators.required, Validators.minLength(6)]);
    this.hidePassword = true;
    this.registrationRequested = false;
  }

  ngOnInit(): void {
  }

  signup(): void {
    if (this.email.valid && this.displayName.valid && this.password.valid
      && this.passwordRepeat.valid && this.password.value == this.passwordRepeat.value) {
      this.authenticator.signUp(this.email.value, this.displayName.value, this.password.value);
    }
  }

  getEmailErrorMessage(): string {
    // invoked if email form field is erroneous

    if (this.email.hasError("required")) {
      return "Email darf nicht leer sein!";
    }

    return this.email.hasError("email") ? "ungültiges Emailformat" : "";
  }

  getPasswordErrorMessage(): string {
    // inkoked if password field is erroneous

    if (this.password.hasError("minLength") || this.password.hasError("required")) {
      return "Passwort muss mindestens 6 Zeichen lang sein!";
    }

    if (this.password.value != this.passwordRepeat.value && this.password.valid && this.passwordRepeat.valid) {
      return "Passwörter stimmen nicht überein!";
    }
    else {
      return "";
    }
  }

  getPasswordRepeatErrorMessage(): string {
    // inkoked if password field is erroneous

    if (this.passwordRepeat.hasError("minLength") || this.passwordRepeat.hasError("required")) {
      return "Passwort muss mindestens 6 Zeichen lang sein!";
    }

    if (this.password.value != this.passwordRepeat.value && this.password.valid && this.passwordRepeat.valid) {
      return "Passwörter stimmen nicht überein!";
    }
    else {
      return "";
    }
  }

  getDisplayNameErrorMessage(): string {
    //

    if (this.displayName.hasError("pattern")) {
      return "Nur ein Wort, rein aus Buchstaben erlaubt!";
    }
    else {
      return "";
    }
  }

}
