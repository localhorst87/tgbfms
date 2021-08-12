import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '../UseCases/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: FormControl;
  password: FormControl;
  hidePassword: boolean;

  constructor(private authenticator: AuthenticationService) {
    this.email = new FormControl("", [Validators.required, Validators.email]);
    this.password = new FormControl("", [Validators.required]);
    this.hidePassword = true;
  }

  ngOnInit(): void {
  }

  login(): void {
    if (this.email.valid && this.password.valid) {
      this.authenticator.login(this.email.value, this.password.value)
    }
  }

  getEmailErrorMessage(): string {
    if (this.email.hasError("required")) {
      return "Email darf nicht leer sein!";
    }

    return this.email.hasError("email") ? "ungültiges Emailformat" : "";
  }

}
