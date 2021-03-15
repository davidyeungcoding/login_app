import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateAccountComponent } from './create-account/create-account.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { SearchComponent } from  './search/search.component'

const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'profile/:username', component: ProfileComponent},
  { path: 'search', component: SearchComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
  // { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
