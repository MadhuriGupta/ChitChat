import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx'
import firebase from 'firebase/app'
import 'firebase/auth'

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private platform:Platform,private router:Router, private splashScreen:SplashScreen) {
    this.initializeApp()
  }

  initializeApp() {
    this.platform.ready().then(() => {
      firebase.auth().onAuthStateChanged((user)=>{
        console.log(user)
        if(user !=null){
          this.router.navigateByUrl('/feed', { replaceUrl: true }) 
        }else{
          this.router.navigateByUrl('/login', { replaceUrl: true }) 
        }
      })
      this.splashScreen.hide();
      //
    
    });
    }
}
