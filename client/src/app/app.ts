import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CalculatorService } from '../services/calculator.service';
import { HistoryEntry } from '../models/history.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  expressionForm: FormGroup;
  history: HistoryEntry[] = [];
  currentPage = 1;
  totalPages = 1;
  result: string | null = null;

  constructor(private fb: FormBuilder, private calcService: CalculatorService) {
    this.expressionForm = this.fb.group({
      expression: ['', [Validators.required, this.mathExpressionValidator]]
    });
  }

  ngOnInit(): void {
    this.loadHistory();
  }

  get expressionControl(): AbstractControl {
    return this.expressionForm.get('expression')!;
  }

  mathExpressionValidator(control: AbstractControl): ValidationErrors | null {
    const regex = /^[0-9+\-*/().\s]+$/;
    return control.value && !regex.test(control.value)
      ? { invalidMathExpression: true }
      : null;
  }

  onSubmit(): void {
    if (this.expressionForm.invalid) return;

    const expression = this.expressionControl.value;

    this.calcService.calculate(expression).subscribe({
      next: (res) => {
        this.result = res.result;

        // Update history directly from response
        this.history = [...res.history.results]; // spread to force change detection
        this.currentPage = res.history.currentPage;
        this.totalPages = res.history.totalPages;

        this.expressionForm.reset();
        this.expressionForm.markAsUntouched();
        this.expressionForm.markAsPristine();
      },
      error: err => {
        console.error('Calculation error:', err);
        this.result = null;
      }
    });
  }

  loadHistory(page: number = this.currentPage): Observable<any> {
    return this.calcService.getHistory(page).pipe(
      tap(data => {
        this.history = [...data.results];
        this.currentPage = data.currentPage;
        this.totalPages = data.totalPages;
      })
    );
  }


  deleteHistoryEntry(id: number): void {
    this.calcService.deleteHistoryEntry(id).pipe(
      switchMap(() => {
        // Calculate target page locally before calling loadHistory
        const targetPage = (this.history.length === 1 && this.currentPage > 1)
          ? this.currentPage - 1
          : this.currentPage;
        return this.loadHistory(targetPage);
      })
    ).subscribe({
      next: () => { }, // Optional: add any visual feedback here
      error: err => console.error('Delete history entry error:', err)
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadHistory(page).subscribe({
        error: err => console.error('Error loading page:', err)
      });
    }
  }
}
