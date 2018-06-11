import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
// import { MatToolbarModule, MatButtonModule } from '@angular/material';

/** Nebular components **/
/*import {
  NbActionsModule, NbCardModule, NbLayoutModule, NbMenuItem, NbMenuModule, NbMenuService, NbSidebarModule, NbSidebarService, NbTabsetModule,
  NbThemeModule,
  NbUserModule
} from '@nebular/theme';*/

import { AppComponent } from './app.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { HomeComponent } from './home/home.component';
import {NbMenuInternalService} from '@nebular/theme/components/menu/menu.service';
import {AppSidebarNavComponent} from '@coreui/angular/lib/sidebar/app-sidebar-nav.component';
import {AppAsideModule, AppBreadcrumbModule, AppFooterModule, AppHeaderModule, AppSidebarModule} from '@coreui/angular';
import {AppBreadcrumbService} from '@coreui/angular/lib/breadcrumb/app-breadcrumb.service';
import {LoginComponent} from './views/login/login.component';
import {RegisterComponent} from './views/register/register.component';

const appRoutes: Routes = [
  // Qui vanno i vari percorsi dei componenti
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    data: { title: 'DoUtDes Home' }
  },
  {
    path: 'signup',
    component: RegisterComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    component: NotfoundComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    NotfoundComponent,
    HomeComponent,
    RegisterComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppSidebarModule,
    AppBreadcrumbModule,
    AppAsideModule,
    AppHeaderModule,
    AppFooterModule,
    RouterModule.forRoot(appRoutes) // { enableTracing: true })
  ],
  exports: [
    // MatButtonModule,
    // MatToolbarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
