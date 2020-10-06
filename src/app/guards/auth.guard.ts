import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private apis: ApiService,
    private router: Router, private toastr: ToastrService) { }
  userAccount: any;

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {


    return this.apis.export().then((result: any) => {


      if (result && result.length) {
        return true;
      } else {
        this.router.navigate(['/']);
        return false;
      }

    }).catch((er) => {
      return false;
    });

  }

}
