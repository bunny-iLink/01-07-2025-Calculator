import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { HistoryEntry } from "../models/history.model";
import { environment } from "../environment/environment";

@Injectable({
    providedIn: "root"
})

export class CalculatorService {
    constructor(private http: HttpClient) { }
    private apiUrl = environment.apiUrl;

    calculate(expression: string): Observable<{ result: string }> {
        return this.http.post<{ result: string }>(`${this.apiUrl}/calculate`, { expression });
    }

    getHistory(page: number = 1): Observable<{
        results: HistoryEntry[],
        totalPages: number,
        currentPage: number,
        totalResults: number
    }> {
        return this.http.get<{
            results: HistoryEntry[],
            totalPages: number,
            currentPage: number,
            totalResults: number
        }>(`${this.apiUrl}/history?page=${page}`);
    }

    deleteHistoryEntry(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/delete-history/${id}`);
    }
}