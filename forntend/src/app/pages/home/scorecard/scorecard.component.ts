import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-scorecard',
  templateUrl: './scorecard.component.html',
  styleUrls: ['./scorecard.component.scss']
})
export class ScorecardComponent {

  scoreCard: any = null;
  inning: string = 'inning1';

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.getScoreCard(params['id']);
      this.inning = params['inning'];
    })
  }

  getScoreCard(id: number) {
    this.apiService.getData(`/scorecard/${id}`)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.scoreCard = res.data;
          }
        },
        (err) => {
          this.toast.success(err.message || err.error.message || "Something Went Wong", "Error")
        }
      )
  }
}
