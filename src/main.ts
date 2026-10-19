import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app/app.routes';
import { importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './app/services/auth-interceptor.service';
import { provideToastr } from 'ngx-toastr';
import { MatNativeDateModule } from '@angular/material/core';

bootstrapApplication(AppComponent, {
  providers: [
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),
      provideAnimations(),
      provideHttpClient(withInterceptorsFromDi()), // Habilita el uso de interceptores
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      provideToastr({
        closeButton: true,
        progressBar: true,
        progressAnimation: 'decreasing',
        timeOut: 5000,
        extendedTimeOut: 2000,
        tapToDismiss: false,
        preventDuplicates: true,
        maxOpened: 3,
        autoDismiss: true,
        positionClass: 'toast-top-right',
      }),
      importProvidersFrom(MatNativeDateModule),
    ]
}).catch(err => console.error(err));
