
  
import { HttpClient} from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { env } from 'src/app/global';
import { socketType } from '../general/home/home.component';

@Component({
  selector: 'app-upload-pic',
  templateUrl: './upload-pic.component.html',
  styleUrls: ['./upload-pic.component.scss']
})
export class UploadPicComponent implements OnInit {

  constructor(private httpClient:HttpClient, private router:Router) { }
  str_code !:string;
  @Input() socket!: socketType;

  
  ngOnInit(): void {
  }

UploadFile(event: any) {
    const file:File = event.target.files[0];


    if (file)
    {
      const formData = new FormData();
      formData.append('file', file);
      this.httpClient.post( env.back_domain_url + "/upload", formData, {withCredentials: true}).subscribe({
        complete: () =>
        {
          this.socket.emit("updatedProfil")
        },
        error: (errCode) => 
        {
          if (errCode.status == 413)
          {
            this.str_code = "File too big, choose a file < 2mo"
          }
          else 
            this.str_code = errCode.error.text;
        },
      })
    }
  }
}
