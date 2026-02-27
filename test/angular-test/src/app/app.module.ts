import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { Tenlixor } from '@verbytes-tenlixor/sdk';
import { TxrTranslatePipe, setTenlixorInstance } from './tenlixor.pipe';

// Initialize Tenlixor SDK
const txr = new Tenlixor({
  tenantSlug: 'verbytes',
  token: 'sk_7de92730_45a45ff50d1dd6f4e1f28854f2eb0544',
  language: 'en'
});

txr.init();
setTenlixorInstance(txr);

// Make instance available globally for AppComponent
(window as any).tenlixorInstance = txr;

@NgModule({
  declarations: [
    AppComponent,
    TxrTranslatePipe
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
