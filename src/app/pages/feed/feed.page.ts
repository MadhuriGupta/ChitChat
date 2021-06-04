import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'
import * as moment from 'moment';
import {ToastController,LoadingController, Platform, ActionSheetController, AlertController} from '@ionic/angular'
import { Router } from '@angular/router';
import { Camera,CameraOptions } from '@ionic-native/camera/ngx';
import { ConnectivityServiceService } from 'src/app/service/connectivity-service.service';
import { debounceTime } from 'rxjs/operators';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit {
  text:string=""
  posts:any[]=[];
  private loader:any;
  private loaderActive:boolean=false;
  subscription:any;
  pageSize:number=10
  cursor:any
  infiniteEvent:any;
  isConnectedtoNetwork:Boolean = true;
  disconnectSubscription:any
  connectSubscription:any
  image:string
  userId:string

  constructor(private toastController:ToastController,private loadController:LoadingController,
              private platform:Platform,private router:Router,private camera:Camera,
              private actionSheetController:ActionSheetController,
              private connectivityService:ConnectivityServiceService,
              private alertController:AlertController,
              private network:Network) { 
              this.connectivityService.getNetworkStatus().pipe(debounceTime(300)).subscribe((connected:boolean) =>{
                this.isConnectedtoNetwork = connected;
                if(!connected)
                this.presentToast("Please check your intenet connection");
              })
              
              
  }

  

  ngOnInit() {
    this.getPosts()
  }

  

  post(){
    if(!this.text){
      this.presentToast("Please enter proper message!")
      return;
    }
    if(this.isConnectedtoNetwork){
      this.showLoader()
      firebase.firestore().collection("posts").add({
        text: this.text,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        owner: firebase.auth().currentUser.uid,
        owner_name:firebase.auth().currentUser.displayName
      }).then((doc) =>{
        
        console.log(doc)
        this.dismissLoader()
        this.text = ""
        if(this.image){
         this.uploadImage(doc.id).then((value) =>{
          
         }).finally(()=>{
          
          setTimeout(()=>{
          
          this.image = undefined
            this.getPosts()
          },500)
         })
        }else{
        setTimeout(()=>{
          this.getPosts()
        },500)
      }
        
      }).catch((err)=>{
        console.log(err)
        this.dismissLoader()
      })
    }else{
      this.presentToast("Please check your internet connection")
    }
    
  }

  getPosts(){
    
    if(this.isConnectedtoNetwork){
    this.posts = [];
    this.showLoader()
    
    firebase.firestore().collection("posts").orderBy("created","desc").limit(this.pageSize).get().then((docs) =>{
      
      docs.forEach((doc) =>{
        this.posts.push(doc);
      })
      this.userId = firebase.auth().currentUser.uid;
      this.cursor = this.posts[this.posts.length-1]
      console.log(this.posts)
      this.dismissLoader()
    }).catch((err)=>{
      console.log(err)
      this.dismissLoader()

    })
  }else{
    this.presentToast("Please check your internet connection")
  }
  }

  loadMorePosts(event){
    this.infiniteEvent = event;
    if(this.isConnectedtoNetwork){
    this.showLoader()
    firebase.firestore().collection("posts").orderBy("created","desc").startAfter(this.cursor).limit(this.pageSize).get().then((docs) =>{
      
      docs.forEach((doc) =>{
        this.posts.push(doc);
      })
      console.log(this.posts)

      if(docs.size< this.pageSize){
        event.target.disabled = true;
      }else{
       event.target.complete()
      this.cursor = this.posts[this.posts.length-1]
      }
      this.dismissLoader()
    }).catch((err)=>{
      console.log(err)
      this.dismissLoader()

    }) 
  }else{
      this.presentToast("Please check your internet connection")
    }
  }

  refresh(event){
    this.getPosts()
    event.target.complete()
    if(this.infiniteEvent != null){
      this.infiniteEvent.target.disabled = false
    }
  }

  deletePost(id,index){
   console.log(id, index)
   if(this.isConnectedtoNetwork){
   firebase.firestore().collection("posts").doc(id).delete()
   this.posts.splice(index,1)
  }else{
    this.presentToast("Please check your internet connection")
  }
  }

  ago(time){
    let difference = moment(time).diff(moment())
    return moment.duration(difference).humanize()
  }

  comingSoon(){
    this.presentToast("Coming Soon")
  }

  async presentToast(str){
    const toast = await this.toastController.create({
       message: str,
       duration:3000
    })
     await toast.present();
  }

  async showLoader() {
    this.loaderActive = true;
    this.loader = await this.loadController.create({
      message: 'Please wait...',
      spinner: 'crescent',
    });
    await this.loader.present();
    }
async dismissLoader() {
    if (this.loaderActive === true) {
      await this.loader.dismiss();
    }
    this.loaderActive = false;
}

ionViewDidEnter(){
  this.subscription = this.platform.backButton.subscribe(()=>{
      navigator['app'].exitApp();
  });
}
ionViewWillLeave(){
  this.subscription.unsubscribe();
}

logout(){
  firebase.auth().signOut().then(() =>{
     this.presentToast("You have logged out successfuly")
     this.router.navigateByUrl('/login', { replaceUrl: true }) 

  });
}

async presentActionSheet(){
  const actionSheet = await this.actionSheetController.create({
    buttons:[
      {
        text:"Gallery",
        handler:() =>{
          console.log("Clicked on Gallery")
          this.openGallery()
        }
      },
      {
        text:"Camera",
        handler:() =>{
          console.log("Clicked on Camera")
          this.openCamera()
        }
      },
      {
        text:"Cancel",
        role:'cancel',
        handler:() =>{
          console.log("Clicked on Cancel")
        }
      },
    ]
  });
  await actionSheet.present();
}

openCamera(){
  let options: CameraOptions={
    quality:100,
    sourceType:this.camera.PictureSourceType.CAMERA,
    destinationType:this.camera.DestinationType.DATA_URL,
    encodingType:this.camera.EncodingType.PNG,
    mediaType:this.camera.MediaType.PICTURE,
    correctOrientation:true,
    targetHeight:512,
    targetWidth:512,
    allowEdit:false
  }
  this.camera.getPicture(options).then((base64image) =>{
    this.image = "data:image/png;base64,"+base64image;

  }).catch((err) =>{
    console.log(err)
  })

}

openGallery(){
  this.camera.getPicture({
    sourceType:this.camera.PictureSourceType.SAVEDPHOTOALBUM,
    destinationType:this.camera.DestinationType.DATA_URL
  }).then((base64image) =>{
    this.image = "data:image/png;base64,"+base64image;
  }).catch((err) =>{
    console.log(err)
  })

}
 uploadImage(name:string){
  return new Promise((resolve,reject) =>{
    let ref = firebase.storage().ref("postImages/"+name);
    let uploadTask = ref.putString(this.image.split(",")[1],"base64")
    uploadTask.on("state_changed",(taskSnapshot) =>{
      console.log(taskSnapshot)
    },(err) =>{
      console.log(err)
    },() =>{
      console.log("The upload is Complete!");
      uploadTask.snapshot.ref.getDownloadURL().then((url) =>{
        
        firebase.firestore().collection("posts").doc(name).update({
          image:url
        }).then((result)=>{
          resolve(result)
        }).catch((err) =>{
          reject()
        })

      }).catch((err) =>{
        console.log(err)
      })
    })
  })
  
}

deleteImage(){
  this.presentAlert()
}

async presentAlert() {
  const alert = await this.alertController.create({
    header: 'Delete Image',
    message: 'Are you sure you want to delete this image ?',
    buttons:[
      {
        text:"YES",
        handler:() =>{
          this.image =""
        }
      },
      {
        text:"NO",
        role:'cancel',
        handler:() =>{
          console.log("Clicked on Cancel")
        }
      },
    ]
  });

  await alert.present();

  const { role } = await alert.onDidDismiss();
  console.log('onDidDismiss resolved with role', role);
}

}
