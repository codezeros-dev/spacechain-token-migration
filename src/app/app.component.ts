import { Component, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'spacechain';
  constructor(@Inject(DOCUMENT) private document: Document){}
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
      document.getElementById('header').classList.add('fixed-header');
    }
    else{
      document.getElementById('header').classList.remove('fixed-header');
    }
  }
}
