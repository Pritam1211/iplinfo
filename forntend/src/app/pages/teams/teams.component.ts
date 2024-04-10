import { Component } from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss']
})
export class TeamsComponent {
  teams: any = null;
  selectedTeam: any;
  team: any;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) { }

  ngOnInit() {
    this.getTeams();
  }

  getTeams() {
    this.apiService.getData(`/teams`)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.teams = res.data;
            this.selectedTeam = this.teams[0];
            this.getTeamMembers();
          }
        },
        (err) => {
          this.toast.success(err.message || err.error.message || "Something Went Wong", "Error")
        }
      )
  }

  getTeamMembers() {
    this.apiService.postData(`/team-members`, { url: this.selectedTeam.href })
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.team = { ...res.data, ...this.selectedTeam };
          }
        },
        (err) => {
          this.toast.success(err.message || err.error.message || "Something Went Wong", "Error")
        }
      )
  }
}
