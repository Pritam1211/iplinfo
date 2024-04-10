import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-points-table',
  templateUrl: './points-table.component.html',
  styleUrls: ['./points-table.component.scss']
})
export class PointsTableComponent {

  pointTable: any = null;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.getPointsTable();
  }

  getPointsTable() {
    this.apiService.getData(`/point-table`)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.pointTable = res.data;
          }
        },
        (err) => {
          this.toast.success(err.message || err.error.message || "Something Went Wong", "Error")
        }
      )
  }
}
