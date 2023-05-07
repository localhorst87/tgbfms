import { Component, OnChanges, OnInit, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';
import { User } from '../Businessrules/basic_datastructures';
import { AppdataAccessService } from '../Dataaccess/appdata-access.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit, OnChanges {
  @Input() user: User;
  @Output() userConfigChange = new EventEmitter<User>();
  notificationsSet: FormControl;
  notificationsTime: FormControl;
  notificationsSingleDay: FormControl;
  darkDefaultTheme: FormControl;
  sliderTimeMax: number;
  sliderTimeMin: number;
  sliderTimeStep: number;

  constructor(private appData: AppdataAccessService) {
    this.user = {
      documentId: "",
      id: "",
      email: "",
      displayName: "",
      isAdmin: false,
      isActive: false,
      configs: {
        theme: "unknown",
        notificationLevel: -1,
        notificationTime: -1
      }
    };

    this.sliderTimeMax = 6;
    this.sliderTimeMin = 0.5;
    this.sliderTimeStep = 0.5;

    this.notificationsSet = new FormControl(false);
    this.notificationsTime = new FormControl(1);
    this.notificationsSingleDay = new FormControl(false);
    this.darkDefaultTheme = new FormControl(false);
  }

  updateUser(): void {
    if (this.user.id.length > 0) {
      this.user.configs = {
        notificationLevel: this.getNotificationLevel(),
        notificationTime: this.notificationsTime.value,
        theme: this.getDefaultTheme()
      };
      
      this.appData.setUser(this.user);
      this.userConfigChange.emit(this.user);
    }
  }

  getNotificationLevel(): number {
    if (this.notificationsSet.value === true && this.notificationsSingleDay.value === false)
      return 2;
    else if (this.notificationsSet.value === true && this.notificationsSingleDay.value === true)
      return 1;
    else
      return 0;
  }

  getDefaultTheme(): string {
    if (this.darkDefaultTheme.value === true)
      return "dark";
    else
      return "light";
  }

  ngOnInit(): void {
    this.notificationsSet.valueChanges.subscribe(() => this.updateUser());
    this.notificationsTime.valueChanges.subscribe(() => this.updateUser());
    this.notificationsSingleDay.valueChanges.subscribe(() => this.updateUser());
    this.darkDefaultTheme.valueChanges.subscribe(() => this.updateUser());    
  }

  // will be called once user is set
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user.firstChange === true) {
      this.notificationsSet.setValue(this.user.configs.notificationLevel > 0);
      this.notificationsTime.setValue(this.user.configs.notificationTime);
      this.notificationsSingleDay.setValue(this.user.configs.notificationLevel == 1);
      this.darkDefaultTheme.setValue(this.user.configs.theme === 'dark');
    }
  }
}
