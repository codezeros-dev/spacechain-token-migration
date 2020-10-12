import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./home/home.component";
import {MyWalletComponent} from "./my-wallet/my-wallet.component";
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path:"",
    component:HomeComponent
  },
  {
    path:"Mywallet/:id",
    component:MyWalletComponent,
    // canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
