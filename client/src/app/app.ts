import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CalculatorService } from '../services/calculator.service';
import { HistoryEntry } from '../models/history.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

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
  showOverview = false;
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
      next: (res: { result: string }) => {
        this.result = res.result; // Save result for display
        // this.expressionForm.reset();
        this.loadHistory();
      },
      error: err => {
        console.error('Calculation error:', err);
        this.result = null; // Clear result on error
      }
    });
  }

  loadHistory(page: number = 1): void {
    this.calcService.getHistory(page).subscribe({
      next: data => {
        this.history = data.results;
        this.currentPage = data.currentPage;
        this.totalPages = data.totalPages;
      },
      error: err => console.error('History loading error:', err)
    });
  }

  deleteHistoryEntry(id: number): void {
    this.calcService.deleteHistoryEntry(id).subscribe({
      next: () => {
        // Reload current page to reflect true state from server
        // Especially important if pagination is involved
        if (this.history.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadHistory(this.currentPage);
      },
      error: err => {
        console.error('Delete history entry error:', err);
        // Optional: Show a user-friendly message
      }
    });
  }


  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadHistory(page);
    }
  }
}
