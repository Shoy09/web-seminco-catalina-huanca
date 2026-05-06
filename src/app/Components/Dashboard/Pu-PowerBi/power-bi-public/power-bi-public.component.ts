import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-power-bi-public',
  imports: [],
  templateUrl: './power-bi-public.component.html',
  styleUrl: './power-bi-public.component.css'
})
export class PowerBiPublicComponent {
  reportUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    // 👉 Pega aquí tu link público de Power BI
    // const url = 'https://app.powerbi.com/reportEmbed?reportId=010a927c-f119-44db-921f-9f2c4bea7e94&autoAuth=true&ctid=e65ba738-dc1c-49d6-8000-880fed1564ce';
  const url = 'https://app.powerbi.com/view?r=eyJrIjoiMDcwNjViYjYtYTEyNS00MmM0LWExMGMtZThjMjEyNjI0NmRlIiwidCI6ImU2NWJhNzM4LWRjMWMtNDlkNi04MDAwLTg4MGZlZDE1NjRjZSIsImMiOjR9'
    this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}