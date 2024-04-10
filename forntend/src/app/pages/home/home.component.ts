import { environment } from 'src/environments/environment';
import { ApiService } from './../../services/api.service';
import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  matches: any[] = [];

  constructor(
    private apiService: ApiService,
    private toast: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getMatches();
  }

  openMatch(id: any) {
    this.router.navigate(['/live-score', id]);
  }

  getMatches() {
    this.apiService.getData('/matches')
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.matches = res.data;
          }
        },
        (err) => {
          this.toast.success(err.message || err.error.message || "Something Went Wong", "Error")
        }
      )
  }

}
