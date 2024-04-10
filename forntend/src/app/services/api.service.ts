import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpService: HttpClient) { }
  baseUrl = environment.API_URL;

  getData(url: string) {
    url = this.baseUrl + url;
    return this.httpService.get(url);
  }
  postData(url: string, body: any) {
    url = this.baseUrl + url;
    return this.httpService.post(url, body);
  }

}
