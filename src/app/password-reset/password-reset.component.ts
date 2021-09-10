import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '../UseCases/authentication.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.css']
})
export class PasswordResetComponent implements OnInit {

  email: FormControl;
  buttonClicked: boolean;
  isValid: boolean;
  lastError: any;

  constructor(private authenticator: AuthenticationService) {
    this.email = new FormControl("", [Validators.required, Validators.email]);
    this.buttonClicked = false;
    this.isValid = false;
    this.lastError = { code: "", message: "" };
  }

  ngOnInit(): void {
  }

  sendResetMail(): void {
    if (this.email.valid) {
      this.authenticator.sendResetMail(this.email.value)
        .then(() => {
          this.buttonClicked = true;
          this.isValid = true;
        })
        .catch((error: any) => {
          this.lastError = error;
          this.buttonClicked = true;
          this.isValid = false;
        });
    }
  }

  getEmailErrorMessage(): string {
    // invoked if email form field is erroneous

    if (this.email.hasError("required")) {
      return "Email darf nicht leer sein!";
    }

    return this.email.hasError("email") ? "ungültiges Emailformat" : "";
  }

}
