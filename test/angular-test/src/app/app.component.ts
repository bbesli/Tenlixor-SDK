import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Tenlixor } from '@verbytes-tenlixor/sdk';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = '🧪 Tenlixor Angular SDK Test';
  logs: string[] = [];
  currentLanguage: string = 'en';
  availableLanguages: string[] = [];
  isReady: boolean = false;

  // Access Tenlixor instance
  private txr: Tenlixor;

  constructor(private cdr: ChangeDetectorRef) {
    // Get the global Tenlixor instance
    this.txr = (window as any).tenlixorInstance;
  }

  ngOnInit() {
    // Setup event listeners
    this.txr.on('loaded', (data: any) => {
      this.addLog(`✅ Translations loaded for language: ${data.language}`);
      this.updateStatus();
      this.cdr.detectChanges();
    });

    this.txr.on('language-changed', (data: any) => {
      this.addLog(`🌍 Language changed from ${data.from} to ${data.to}`);
      this.updateStatus();
      this.cdr.detectChanges();
    });

    this.txr.on('error', (error: any) => {
      this.addLog(`❌ Error: ${error.code} - ${error.message}`);
      this.cdr.detectChanges();
    });

    this.updateStatus();
    this.cdr.detectChanges();
  }

  updateStatus() {
    this.currentLanguage = this.txr.getLanguage();
    this.availableLanguages = this.txr.getAvailableLanguages();
    this.isReady = this.txr.isReady();
  }

  async changeLanguage(lang: string) {
    try {
      this.addLog(`Switching to ${lang}...`);
      await this.txr.setLanguage(lang);
      this.addLog(`✅ Successfully switched to ${lang}`);
      this.cdr.detectChanges();
    } catch (error: any) {
      this.addLog(`❌ Failed to switch language: ${error.message}`);
      this.cdr.detectChanges();
    }
  }

  addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.logs.push(`[${timestamp}] ${message}`);
  }

  clearLogs() {
    this.logs = [];
  }

  isCurrentLanguage(lang: string): boolean {
    return this.currentLanguage === lang;
  }
}
