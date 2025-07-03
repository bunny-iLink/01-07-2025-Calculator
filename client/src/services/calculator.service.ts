import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { HistoryEntry } from "../models/history.model";
import { environment } from "../environment/environment";

interface HistoryData {
    results: HistoryEntry[];
    totalPages: number;
    currentPage: number;
    totalResults: number;
}

interface CalculationResponse {
    result: string;
    history: HistoryData;
}

@Injectable({
    providedIn: "root"
})
export class CalculatorService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    calculate(expression: string): Observable<CalculationResponse> {
        return this.http.post<CalculationResponse>(`${this.apiUrl}/calculate`, { expression });
    }

    getHistory(page: number = 1): Observable<HistoryData> {
        return this.http.get<HistoryData>(`${this.apiUrl}/history?page=${page}`);
    }

    deleteHistoryEntry(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/delete-history/${id}`);
    }
}
