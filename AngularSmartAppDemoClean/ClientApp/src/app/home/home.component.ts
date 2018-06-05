import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/octet-stream',
    'Ocp-Apim-Subscription-Key': '825bc78c9cf144e9862de1ce7f9925d7'
  })
};

const httpOptionsVerify = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json; charset=utf-8',
    'Ocp-Apim-Subscription-Key': '825bc78c9cf144e9862de1ce7f9925d7'
  })
};

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent {
  @ViewChild("video")
  public video: ElementRef;
  @ViewChild("canvas")
  public canvas: ElementRef;

  public _http: HttpClient;
  public captures: Array<any>;
  public resultList: FaceAPIResult[] = [];
  public faceIdDetail: string;
  public faceId: string[] = [];
  public faceIdentificationDetail: string;
  public constructor(http: HttpClient) {
    this._http = http;
    this.captures = [];
  }

  public ngAfterViewInit() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        this.video.nativeElement.src = window.URL.createObjectURL(stream);
        this.video.nativeElement.play();
      });
    }
  }

  public capture() {
    var context = this.canvas.nativeElement.getContext("2d").drawImage(this.video.nativeElement, 0, 0, 640, 480);
    var url = this.canvas.nativeElement.toDataURL("image/png");
    this.captures.push(url);
    var blob = this.makeblob(url);
    this._http.post<FaceAPIResult[]>('https://southeastasia.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false&returnFaceAttributes=age,gender,headPose,smile,facialHair,glasses,emotion', blob, httpOptions).subscribe(result => {
      this.resultList = result;
      this.faceIdDetail = JSON.stringify(this.resultList);
      if (this.resultList[0].faceId) {
        this.faceId.push(this.resultList[0].faceId);
      }
      console.log(this.resultList[0].faceId);
      console.log('faceId>>' + this.faceId);
    }, error => console.error(error));
  }
  public compare() {
    if (this.faceId.length > 1) {
      let faceVerificationRequest: FaceVerificationRequest = new FaceVerificationRequest();
      faceVerificationRequest.faceId1 = this.faceId[this.faceId.length - 1];
      faceVerificationRequest.faceId2 = this.faceId[this.faceId.length - 2];

      this._http.post<FaceVerificationResult>('https://southeastasia.api.cognitive.microsoft.com/face/v1.0/verify/', JSON.stringify(faceVerificationRequest), httpOptionsVerify).subscribe(result => {
        var i = result;
        this.faceIdentificationDetail = JSON.stringify(i);
        if (i.isIdentical) {
          console.log('identical?>> ' + i.isIdentical);
          console.log('confidence>> ' + i.confidence);
        }
      }, error => console.error(error));
    } else {
      alert('Error: Comparison requires at least two photos');
    }
  }


  public makeblob(dataURL): any {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = decodeURIComponent(parts[1]);
      return new Blob([raw], { type: contentType });
    }
    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
  }
}


export class FaceVerificationRequest {
  faceId1: string;
  faceId2: string;
}
export class FaceVerificationResult {
  isIdentical: string;
  confidence: string;
}

export class ImageObj {
  type: string;
  url: string;
}
export class FaceRectangle {
  top: number;
  left: number;
  width: number;
  height: number;
}

export class HeadPose {
  pitch: number;
  roll: number;
  yaw: number;
}

export class FacialHair {
  moustache: number;
  beard: number;
  sideburns: number;
}

export class Emotion {
  anger: number;
  contempt: number;
  disgust: number;
  fear: number;
  happiness: number;
  neutral: number;
  sadness: number;
  surprise: number;
}

export class Blur {
  blurLevel: string;
  value: number;
}

export class Exposure {
  exposureLevel: string;
  value: number;
}

export class Noise {
  noiseLevel: string;
  value: number;
}

export class Makeup {
  eyeMakeup: boolean;
  lipMakeup: boolean;
}

export class Occlusion {
  foreheadOccluded: boolean;
  eyeOccluded: boolean;
  mouthOccluded: boolean;
}

export class HairColor {
  color: string;
  confidence: number;
}

export class Hair {
  bald: number;
  invisible: boolean;
  hairColor: HairColor[];
}

export class FaceAttributes {
  smile: number;
  headPose: HeadPose;
  gender: string;
  age: number;
  facialHair: FacialHair;
  glasses: string;
  emotion: Emotion;
  blur: Blur;
  exposure: Exposure;
  noise: Noise;
  makeup: Makeup;
  accessories: any[];
  occlusion: Occlusion;
  hair: Hair;
}

export class FaceAPIResult {
  faceId: string;
  faceRectangle: FaceRectangle;
  faceAttributes: FaceAttributes;
}
