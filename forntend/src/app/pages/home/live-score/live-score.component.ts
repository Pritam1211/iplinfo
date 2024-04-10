import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-live-score',
  templateUrl: './live-score.component.html',
  styleUrls: ['./live-score.component.scss']
})
export class LiveScoreComponent {
  liveScore: any = null;
  matchInfo: any = null;
  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.getLiveScore(params['id']);
      this.getMatchInfo(params['id'])
    })
  }

  getLiveScore(id: number) {
    this.apiService.getData(`/live-score/${id}`)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.liveScore = res.data;
          }
        },
        (err) => {
          this.toast.success(err.message || err.error.message || "Something Went Wong", "Error")
        }
      )
  }

  getMatchInfo(id: number) {
    this.apiService.getData(`/match-info/${id}`)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.matchInfo = res.data;
          }
        },
        (err) => {
          this.toast.success(err.message || err.error.message || "Something Went Wong", "Error")
        }
      )
  }

}
