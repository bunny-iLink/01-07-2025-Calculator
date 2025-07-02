import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  styleUrls: ['./app.css']
})
export class App {
  expressionForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.expressionForm = this.fb.group({
      expression: ['', [Validators.required, this.mathExpressionValidator]]
    });
  }

  get expressionControl(): AbstractControl {
    return this.expressionForm.get('expression')!;
  }

  mathExpressionValidator(control: AbstractControl): ValidationErrors | null {
    const regex = /^[0-9+\-*/().\s]+$/;
    const value = control.value;
    if (value && !regex.test(value)) {
      return { invalidMathExpression: true };
    }
    return null;
  }
}
