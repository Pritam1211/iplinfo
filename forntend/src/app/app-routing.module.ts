import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PointsTableComponent } from './pages/points-table/points-table.component';
import { TeamsComponent } from './pages/teams/teams.component';
import { LiveScoreComponent } from './pages/home/live-score/live-score.component';
import { ScorecardComponent } from './pages/home/scorecard/scorecard.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'points-table',
    component: PointsTableComponent
  },
  {
    path: 'teams',
    component: TeamsComponent
  },
  {
    path: 'live-score/:id',
    component: LiveScoreComponent
  },
  {
    path: 'scorecard/:id/:inning',
    component: ScorecardComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
