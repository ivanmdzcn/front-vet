import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-reportes-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './reportes-list.component.html',
  styleUrls: ['./reportes-list.component.scss']
})
export class ReportesListComponent {
  ordenIdControl = new FormControl('', [Validators.required, Validators.min(1)]);

  constructor(private router: Router) {}

  verReporteOrden(): void {
    if (this.ordenIdControl.valid) {
      const ordenId = this.ordenIdControl.value;
      this.router.navigate(['/reportes/orden-pago', ordenId]);
    }
  }
}
