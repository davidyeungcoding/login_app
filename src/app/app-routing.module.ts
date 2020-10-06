import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateAccountComponent } from './create-account/create-account.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile/profile.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'profile', component: ProfileComponent},
  { path: '', redirectTo: 'home', pathMatch: 'full' }
  // { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
