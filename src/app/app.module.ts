import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import firebase from 'firebase/app';
import 'firebase/firestore'
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import {Network} from '@ionic-native/network/ngx';

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "xxxxxxxxxxxx",
  projectId: "xxxxxxx",
  storageBucket: "xxxxxxxxxxxx",
  messagingSenderId: "xxxxxxxxxx",
  appId: "xxxxxxxxxxxxxxx"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.firestore().settings({})

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },SplashScreen,Camera,Network],
  bootstrap: [AppComponent],
})
export class AppModule {}
