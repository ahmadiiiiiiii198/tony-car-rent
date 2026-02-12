# AutoScout24.it — Blueprint completo (struttura + funzionalità)

Obiettivo di questo file: descrivere **tutte le parti principali** di AutoScout24.it e come funzionano, in modo da poterle replicare come esperienza (UX + flussi + stati) nel tuo sito.

Regole:
- Questo non è codice: è un **manuale di implementazione**.
- Copiare **pattern UX e flussi**, non testi/immagini/marchi.
- Dove dico “pagina”, intendo una route o un contesto equivalente.

---

## 1) Struttura globale (presente quasi ovunque)

1. **Skip link accessibilità**
   - Link iniziale tipo `Passa al contenuto principale`.
   - Porta a un anchor nel `main` (focus + scroll).

2. **Header (banner)**
   - **Hamburger “Menu principale”**
     - Apre navigazione globale.
     - Contiene spesso link principali (ricerca auto, categorie, servizi, area dealer, ecc.).
   - **Logo**
     - Link alla home.
   - **Preferiti**
     - Link a `/favorites`.
   - **Account/Login**
     - In molti contesti è visibile dal menu o da un’area dedicata.

3. **Main content**
   - Contiene il contenuto pagina.
   - Layout ricorrente per le pagine “search/list”:
     - colonna sinistra: filtri
     - colonna destra: risultati

4. **Footer (contentinfo)**
   - Struttura ricorrente:
     - **Società**: about, stampa, condizioni generali, informazioni, privacy, accessibilità.
     - **Servizi**: contatti, marche e modelli, auto usate per regione, consigli/magazine.
     - **Area rivenditori**: servizi dealer, login, registrazione, contatti.
     - **Sempre con te**: app iOS/Android + social.
     - **Selettore paese/lingua**.

5. **Cookie consent / privacy settings**
   - Banner informativo.
   - Pulsanti tipici:
     - `Accetta tutto`
     - `Impostazioni` (gestione granularità)
   - Persistenza delle scelte (local storage/cookie) + adeguamento tracking.

---

## 2) Home page (`/`)

La home è principalmente un “entry point” per iniziare ricerche diverse.

1. **Tab / switch per tipologia veicolo**
   - Tab visivi (icona + testo) per:
     - Auto
     - Moto (o 2-ruote a seconda del paese)
     - Caravan/Roulotte
     - Camion
     - Trailer
   - Alcuni sono **link diretti** alla ricerca avanzata con parametri (es. `atype=...`).

2. **Widget di ricerca rapida**
   - Campo principale: `Marca` (select/combobox con lista molto lunga).
   - Altri campi tipici:
     - Modello (dipende da marca)
     - Prezzo
     - Anno
     - Località
   - CTA: bottone di ricerca che porta alla list page.

3. **Sezioni marketing/editoriali**
   - Blocchi che spiegano:
     - “Trova veicoli usati e nuovi”
     - “Vuoi vendere la tua auto?”
     - “Magazine/consigli”
   - Sono contenuti informativi e SEO.

---

## 3) Ricerca avanzata (`/ricerca-avanzata`)

Questa è la pagina centrale per costruire query complesse.

1. **Titolo pagina + reset**
   - Titolo: `Ricerca avanzata`.
   - Pulsante: `Rimuovi filtri`.

2. **Filtri a sezioni (accordion)**
   - Esempi di sezioni:
     - Dati principali & Località
     - Ambiente
     - Altre informazioni
   - Ogni sezione contiene gruppi di controlli.

3. **Filtri core (quasi sempre presenti per le auto)**
   - Marca (combobox)
   - Modello (dipende da marca)
   - Carrozzeria
   - Carburante
   - Cambio
   - Anno immatricolazione (min/max)
   - Prezzo (min/max)
   - Località (città/CAP + raggio)
   - Chilometraggio (min/max)

4. **Filtri “qualità prezzo” (price evaluation)**
   - Badge/categorie tipo:
     - Super prezzo
     - Ottimo prezzo
     - Buon prezzo
   - È un filtro “semantico” basato su confronto mercato.

5. **CTA risultati**
   - Pulsante che mostra numero risultati (es. `390.587 risultati`).
   - Click → pagina risultati con query applicata.

---

## 4) Risultati ricerca (List page)

Layout standard: sidebar filtri + lista card.

1. **Header risultati**
   - Titolo con conteggio (es. `80 Offerte per la tua ricerca`).
   - Breadcrumb o riepilogo filtri (a volte in pill).

2. **Sorting**
   - Dropdown “Ordina per” con opzioni tipiche:
     - Rilevanza
     - Prezzo crescente/decrescente
     - Data inserimento / nuove offerte
     - Chilometraggio
     - Potenza
     - Anno

3. **Salva ricerca**
   - Pulsante `Salva ricerca`.
   - Comportamento:
     - salva filtri + sort
     - spesso richiede account per sync
     - abilita notifiche su nuove offerte o ribassi

4. **Sidebar filtri (sinistra)**
   - Stessi filtri della ricerca avanzata.
   - Mostra filtri attivi.
   - Reset singolo filtro.
   - Reset totale.

5. **Lista card (destra)**
   - Ogni card include:
     - Titolo annuncio (marca + modello + versione)
     - Foto + contatore foto
     - Prezzo
     - Key facts: anno, km, carburante, potenza, cambio
     - Venditore + località
     - Azioni:
       - `Salva` (preferito)
       - `Confronta` (selezione compare)

6. **Compare bar (sticky, in basso)**
   - Messaggio: `Seleziona almeno 2 veicoli da confrontare.`
   - Pulsanti:
     - `Confronta` (disabilitato finché selezione < 2)
     - `Cancella tutto`

7. **Pagination**
   - Navigazione pagine con `Precedente`/`Successivo`.
   - Stato URL tipico: `page=1`.

---

## 5) Dettaglio annuncio (`/annunci/...`)

1. **Header navigazione**
   - Link: `Torna alla lista dei risultati`.
   - Controlli: `Indietro` / `Avanti`.
   - Indicatore posizione (es. `19/80`).

2. **Gallery foto**
   - Carosello principale.
   - Miniature.
   - Fullscreen.
   - Contatore (es. `1/20`).

3. **Azioni annuncio**
   - `Salva` (preferiti)
   - `Condividi`
   - `Stampa`
   - `Confronta`

4. **Blocco prezzo + contatto**
   - Prezzo evidente.
   - CTA tipiche:
     - `Contatta venditore`
     - `Mostra numero`
   - A volte: opzioni di finanziamento.

5. **Blocco venditore**
   - Dealer o privato.
   - Rating/recensioni.
   - Link a pagina dealer.

6. **Specifiche principali**
   - Riga/box con:
     - anno
     - km
     - carburante
     - potenza
     - cambio
   - Sezioni aggiuntive (equipaggiamenti, emissioni, consumi, ecc.).

---

## 6) Preferiti (`/favorites`)

1. **Empty state (quando vuoto)**
   - Titolo: `La lista preferiti è vuota.`
   - Spiegazione benefici:
     - notifiche ribasso prezzo
     - sconti/promozioni
     - confronto annunci
   - CTA: `Inizia ora la ricerca`.
   - CTA login per sincronizzare su dispositivi.

2. **Quando ci sono preferiti**
   - Lista card simili alla list page.
   - Azioni: rimuovi preferito, confronta.

---

## 7) Compare (comportamento)

1. Selezione avviene su list page con checkbox `Confronta`.
2. Compare bar aggrega la selezione.
3. `Confronta` porta a pagina confronto:
   - tabella specs
   - rimozione singolo veicolo
   - clear all

---

## 8) Area rivenditori (macro)

1. Link “Area rivenditori” nel footer o menu.
2. Include:
   - login
   - registrazione
   - servizi per dealer
3. Le pagine dealer (pubbliche) tipicamente mostrano:
   - profilo
   - inventario
   - recensioni
   - contatti

---

## 9) Componenti di sistema (tracking/ads)

1. Consent manager collegato a:
   - analytics
   - advertising
2. Presenza di blocchi advertising (es. GPT) in varie pagine.
3. Stati importanti:
   - loading skeleton
   - error states
   - empty states

---

## 10) Checklist implementazione (per copiare l’esperienza)

1. **Routing minimo**
   - Home
   - Ricerca avanzata
   - Risultati
   - Dettaglio annuncio
   - Preferiti
   - Compare
   - Dealer page
   - Account/login (anche solo placeholder)

2. **State model minimo**
   - Filters state (molti campi)
   - Sorting
   - Pagination
   - Favorites (persistenza)
   - Compare selection (persistenza)
   - Saved searches (persistenza)

3. **Data model minimo (Vehicle)**
   - id
   - brand
   - model
   - title/version
   - price
   - year
   - mileage
   - fuel
   - transmission
   - power
   - location
   - sellerType + dealer info
   - images[]

4. **Vincoli legali**
   - Non copiare testi, immagini, marchi.
   - Copiare solo UX e flussi.
