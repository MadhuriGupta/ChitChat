import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router'
import firebase from 'firebase/app'
import 'firebase/auth'
import {ToastController} from '@ionic/angular'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email:string = ""
  password:string=""

  constructor(private router: Router,public tostController:ToastController ){ 
   
  }

  ngOnInit() {
    
  }

  login(){
    firebase.auth().signInWithEmailAndPassword(this.email,this.password)
    .then((user) =>{
     //this.presentToast("Logged in successfully")
     //this.router.navigate(['/home']);
     this.router.navigateByUrl('/feed', { replaceUrl: true }) 
    }).catch((err) =>{
      console.log(err)
      this.presentToast(err.message)
    })
  }
  async presentToast(str){
    const toast = await this.tostController.create({
       message: str,
       duration:3000
    })
     await toast.present();
  }
  gotoSignUp(){
    this.router.navigate(['/register']);
  }
}
