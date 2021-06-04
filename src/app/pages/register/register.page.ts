import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common'
import firebase from 'firebase/app'
import 'firebase/auth'
import {ToastController,AlertController} from '@ionic/angular'

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  name:string=""
  email:string=""
  password:string=""

  constructor(private location: Location,
    private toastController:ToastController,
    private alertController:AlertController) { }

  ngOnInit() {
  }

  signUp(){
    firebase.auth().createUserWithEmailAndPassword(this.email,this.password).then(
    (data)=>{
      console.log(data)
      let newUser: firebase.User = data.user;
      newUser.updateProfile({
        displayName: this.name,
        photoURL:""
      }).then(()=>{
        console.log("Profile Updated")
        this.showAlert()
      }).catch((err) =>{
        console.log(err)
        this.presentToast(err.message);
      } )
    }).catch((err)=>{
      console.log(err)
    })
  }

  goBack(){
    this.location.back();
    
  }

  async presentToast(str){
    const toast = await this.toastController.create({
       message: str,
       duration:3000
    })
     await toast.present();
  }

  async showAlert(){
    const alert = await this.alertController.create({
      header: 'Account Created',
      message: 'Your account has been created successfuly\n Please login to continue',
      buttons: [{
        text:'OK',
        handler:() =>{
          this.goBack()
        }
      }
      ]
    });

    await alert.present();
  }

}
