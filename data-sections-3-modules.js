// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MODULE 1: TERME & MUSTER                                          ║
// ║  Cross-topic: Zahlenfolgen + Geometrie + Funktionen + Alltag        ║
// ╚══════════════════════════════════════════════════════════════════════╝

const TITEL='Mathe-Check';
const UNTERTITEL='Terme & Muster';
const HERO_ICON='🔢';
const MODULE_ID='terme-muster';
const INFO_CHIPS=['15 Fragen','Mit Lösungen','5 Level'];
const CONFIG={examTotalTime:5400};

// ==================== DATA SECTION (v5.0 ENHANCED) ====================

// Operatoren-Tooltips (Feature 8)
const OPERATOREN={
  berechne: 'Ergebnis durch Rechnung ermitteln. Rechenweg angeben!',
  bestimme: 'Lösung durch Überlegung oder Rechnung finden.',
  begruende: 'Aussage mit mathematischen Argumenten stützen.',
  beschreibe: 'Sachverhalt in eigenen Worten wiedergeben.',
  erklaere: 'Zusammenhang verständlich darstellen.',
  zeige: 'Nachweis durch logische Argumentation führen.',
  skizziere: 'Grobe Zeichnung mit wichtigen Merkmalen anfertigen.',
  zeichne: 'Maßstabsgetreue, exakte Darstellung erstellen.',
  vergleiche: 'Gemeinsamkeiten und Unterschiede herausarbeiten.',
  interpretiere: 'Bedeutung im Sachzusammenhang erklären.'
};

// Leitideen (Feature 6)
const LBK={
  L1:{code:'L1',name:'Zahl & Operation'},
  L2:{code:'L2',name:'Messen & Größen'},
  L3:{code:'L3',name:'Raum & Form'},
  L4:{code:'L4',name:'Funktionaler Zusammenhang'},
  L5:{code:'L5',name:'Daten & Zufall'}
};

const SELF_ASSESS_CATS=[
  {id:'zahlenfolgen',label:'Zahlenfolgen erkennen & fortsetzen'},
  {id:'bildmuster',label:'Bildmuster & geometrische Folgen'},
  {id:'terme_aufstellen',label:'Terme zu Mustern aufstellen'},
  {id:'gesetze_erkennen',label:'Gesetzmäßigkeiten erkennen & beschreiben'},
  {id:'funktionen_folgen',label:'Folgen als Funktionen interpretieren'},
  {id:'sachkontexte_muster',label:'Muster in Sachkontexten'}
];

const MV={
  M1:{code:'M1',title:'Folgenglied vs. Stellennummer',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:[]},
  M2:{code:'M2',title:'Konstante vs. wachsende Differenz',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M1']},
  M3:{code:'M3',title:'Termaufstellung aus Mustern',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M1','M2']},
  M4:{code:'M4',title:'Lineares vs. quadratisches Wachstum',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M2']},
  M5:{code:'M5',title:'Geometrische Muster abzählen',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:[]},
  M6:{code:'M6',title:'Rekursive vs. explizite Darstellung',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M3']},
  M7:{code:'M7',title:'Variable als Platzhalterfehler',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M3']},
  M8:{code:'M8',title:'Verallgemeinerung & Begründung',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M3','M6']}
};

const KLP={
  K1:{code:'K1',name:'Argumentieren & Beweisen'},
  K2:{code:'K2',name:'Problemlösen'},
  K3:{code:'K3',name:'Modellieren'},
  K4:{code:'K4',name:'Darstellungen nutzen'},
  K5:{code:'K5',name:'Kommunizieren'},
  K6:{code:'K6',name:'Werkzeuge nutzen'}
};

// Productive Failure (Feature 7)
const PRODUCTIVE_FAILURE={
  text:'Eine Treppe wird aus Streichhölzern gebaut. Stufe 1 braucht 4 Hölzer, Stufe 2 braucht 10 Hölzer, Stufe 3 braucht 18 Hölzer. Wie viele Hölzer braucht Stufe 10? Stelle einen Term auf.',
  type:'input',
  answer:220,
  tol:0,
  unit:'',
  context:'Die Streichholz-Treppe: ein Muster erkennen, das sowohl arithmetisch als auch geometrisch denken erfordert.'
};

const Q=[
  {id:'q1',klp:'K4',l:'L1',mvTarget:'M1',type:'mc',xp:10,cat:'Zahlenfolgen',ab:1,teil:1,text:'Gegeben ist die Folge: 3, 7, 11, 15, 19, ... Welches ist das 8. Folgenglied?',opts:['27','29','31','33'],answer:2,optMV:[null,'M1','M2',null],operator:'bestimme',fb_ok:'Richtig! Die Folge hat die konstante Differenz 4. Das 8. Glied: 3 + 7·4 = 31.',fb_nok:'Die Differenz zwischen aufeinanderfolgenden Gliedern beträgt 4. Vom 1. zum 8. Glied sind es 7 Schritte.',mv_nok:'M1',denkfehler:'Stellennummer n mit Folgenglied a(n) verwechselt oder Schrittanzahl falsch gezählt.',naechster_schritt:'Zähle die Schritte: Vom 1. zum n-ten Glied sind es (n-1) Schritte.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'d = 4, a(n) = 3 + (n-1)·4. a(8) = 3 + 7·4 = 3 + 28 = 31'},

  {id:'q2',klp:'K2',l:'L1',mvTarget:'M2',type:'input',xp:12,cat:'Zahlenfolgen',ab:1,teil:1,text:'Gegeben ist die Folge: 2, 5, 10, 17, 26, ... Berechne die Differenz zwischen dem 5. und dem 4. Folgenglied.',hint:'Bilde die Differenzen aufeinanderfolgender Glieder und achte auf das Muster.',answer:9,tol:0,unit:'',fb_ok:'Richtig! Die Differenzen sind 3, 5, 7, 9, ... -- sie wachsen um jeweils 2.',fb_nok:'Berechne: 26 - 17 = 9. Die Differenzen der Folge wachsen selbst.',mv_nok:'M2',denkfehler:'Annahme einer konstanten Differenz, obwohl die Differenzen selbst wachsen.',naechster_schritt:'Bilde immer erst die Differenzenfolge, um das Muster zu erkennen.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'Differenzen: 5-2=3, 10-5=5, 17-10=7, 26-17=9. Die Differenz zwischen 5. und 4. Glied ist 9.'},

  {id:'q3',klp:'K3',l:'L3',mvTarget:'M5',type:'mc',xp:11,cat:'Bildmuster',ab:1,teil:1,text:'Aus Streichhölzern werden Quadratketten gebaut: 1 Quadrat braucht 4 Hölzer, 2 Quadrate brauchen 7 Hölzer, 3 Quadrate brauchen 10 Hölzer. Wie viele Hölzer braucht man für 10 Quadrate? (Cross-topic: Geometrie + Folgen)',opts:['31','34','30','40'],answer:0,optMV:[null,'M5','M3','M5'],operator:'berechne',fb_ok:'Korrekt! Jedes weitere Quadrat braucht 3 Hölzer (eine Seite wird geteilt). T(n) = 3n + 1. T(10) = 31.',fb_nok:'Jedes neue Quadrat teilt sich eine Seite mit dem vorherigen. Das erste braucht 4, jedes weitere 3.',mv_nok:'M5',denkfehler:'Alle 4 Seiten pro Quadrat gezählt, ohne geteilte Seiten zu berücksichtigen.',naechster_schritt:'Zeichne die Figur und zähle systematisch.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'T(n) = 3n + 1. T(10) = 30 + 1 = 31.'},

  {id:'q4',klp:'K3',l:'L4',mvTarget:'M3',type:'input',xp:13,cat:'Terme aufstellen',ab:2,teil:1,text:'In einem Muster hat die n-te Figur 2n + 3 Punkte. Wie viele Punkte hat die 20. Figur?',hint:'Setze n = 20 in den Term ein.',answer:43,tol:0,unit:'',fb_ok:'Richtig! T(20) = 2·20 + 3 = 43.',fb_nok:'Setze n = 20 ein: T(20) = 2·20 + 3 = 40 + 3 = 43.',mv_nok:'M3',denkfehler:'Falsches Einsetzen in den Term oder Rechenreihenfolge vertauscht.',naechster_schritt:'Übe das Einsetzen von Werten in Terme.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'T(n) = 2n + 3. T(20) = 2·20 + 3 = 43'},

  {id:'q5',klp:'K4',l:'L4',mvTarget:'M4',type:'mc',xp:12,cat:'Gesetzmäßigkeiten',ab:2,teil:1,text:'Die Folge 1, 4, 9, 16, 25, ... beschreibt welches Muster? (Cross-topic: Folge als Funktion)',opts:['f(n) = n + 3','f(n) = n²','f(n) = 2n - 1','f(n) = 3n - 2'],answer:1,optMV:['M4',null,'M4','M4'],operator:'bestimme',fb_ok:'Richtig! Das sind die Quadratzahlen: 1², 2², 3², 4², 5², ... Die Funktion ist f(n) = n².',fb_nok:'Prüfe: 1²=1, 2²=4, 3²=9. Das sind Quadratzahlen!',mv_nok:'M4',denkfehler:'Lineares Wachstum vermutet, obwohl quadratisches Wachstum vorliegt.',naechster_schritt:'Vergleiche lineares (konstante Differenzen) und quadratisches Wachstum (wachsende Differenzen).',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'f(n) = n². Prüfung: f(1)=1, f(2)=4, f(3)=9, f(4)=16, f(5)=25.'},

  {id:'q6',klp:'K1',l:'L3',mvTarget:'M5',type:'input',xp:12,cat:'Bildmuster',ab:1,teil:1,text:'Dreiecke werden zu einer Reihe zusammengesetzt. 1 Dreieck: 3 Streichhölzer. 2 Dreiecke: 5 Streichhölzer. 3 Dreiecke: 7 Streichhölzer. Wie viele Streichhölzer braucht man für 15 Dreiecke? (Cross-topic: Geometrie)',hint:'Finde den Term T(n) und setze n = 15 ein.',answer:31,tol:0,unit:'',fb_ok:'Richtig! T(n) = 2n + 1. T(15) = 30 + 1 = 31.',fb_nok:'Die Differenz ist immer 2. T(n) = 2n + 1. T(15) = 31.',mv_nok:'M5',denkfehler:'Pro Dreieck 3 Streichhölzer gezählt, ohne geteilte Seiten.',naechster_schritt:'Erkenne, dass benachbarte Figuren Seiten teilen.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'T(1)=3, T(2)=5, T(3)=7. Differenz: 2. T(n) = 2n + 1. T(15) = 31.'},

  {id:'q7',klp:'K5',l:'L1',mvTarget:'M6',type:'mc',xp:11,cat:'Gesetzmäßigkeiten',ab:2,teil:1,text:'Eine Folge ist rekursiv definiert: a₁ = 5, a(n+1) = a(n) + 4. Welche explizite Formel beschreibt dieselbe Folge?',opts:['a(n) = 5n','a(n) = 4n + 5','a(n) = 4n + 1','a(n) = 5 + 4n'],answer:2,optMV:['M6',null,'M6',null],operator:'bestimme',fb_ok:'Korrekt! a(1) = 4·1 + 1 = 5, a(2) = 4·2 + 1 = 9, a(3) = 4·3 + 1 = 13. Passt!',fb_nok:'Prüfe durch Einsetzen: a(1) muss 5 ergeben. 4·1 + 1 = 5. Stimmt!',mv_nok:'M6',denkfehler:'Rekursive und explizite Darstellung verwechselt oder Startwert falsch verarbeitet.',naechster_schritt:'Setze n = 1 in jeden Vorschlag ein und prüfe, ob a(1) = 5 herauskommt.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'a(1) = 5, d = 4. Explizit: a(n) = a(1) + (n-1)·d = 5 + 4(n-1) = 4n + 1.'},

  {id:'q8',klp:'K3',l:'L2',mvTarget:'M3',type:'input',xp:14,cat:'Terme aufstellen',ab:2,teil:2,text:'Ein Schwimmbad wird befüllt. Nach 1 Minute sind 50 Liter drin, nach 2 Minuten 100 Liter, nach 3 Minuten 150 Liter. Stelle einen Term auf und berechne: Wie viele Liter sind nach 45 Minuten im Becken? (Cross-topic: Realwelt + Funktionen)',hint:'Erkenne den linearen Zusammenhang: V(t) = 50·t.',answer:2250,tol:0,unit:'Liter',fb_ok:'Richtig! V(t) = 50t. V(45) = 50·45 = 2250 Liter.',fb_nok:'Die Wassermenge wächst linear: 50 Liter pro Minute. V(45) = 50·45 = 2250.',mv_nok:'M3',denkfehler:'Falschen Term aufgestellt oder Einheiten nicht beachtet.',naechster_schritt:'Lies die Steigung (Zunahme pro Schritt) ab und stelle den Term T(n) = Steigung · n auf.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'V(t) = 50·t. V(45) = 50 · 45 = 2250 Liter.'},

  {id:'q9',klp:'K1',l:'L1',mvTarget:'M7',type:'mc',xp:11,cat:'Terme aufstellen',ab:2,teil:2,text:'Für ein Punktmuster gilt der Term T(n) = n² + 2. Was bedeutet n in diesem Zusammenhang?',opts:['Die Anzahl der Punkte','Die Nummer der Figur','Das Ergebnis der Rechnung','Die Gesamtzahl aller Figuren'],answer:1,optMV:['M7',null,'M7','M7'],operator:'erklaere',fb_ok:'Richtig! n ist die Stellennummer, also welche Figur gemeint ist. T(n) gibt die Punktanzahl an.',fb_nok:'n ist die Variable für die Figurennummer. T(n) = n² + 2 gibt die Anzahl der Punkte der n-ten Figur an.',mv_nok:'M7',denkfehler:'Variable n als Ergebnis oder Anzahl interpretiert statt als Platzhalter für die Stellennummer.',naechster_schritt:'Unterscheide klar: n = Figurennummer, T(n) = Anzahl der Elemente.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'n ist die Nummer der Figur (Stellennummer). T(n) ist die Anzahl der Punkte. z.B. T(3) = 9 + 2 = 11 Punkte.'},

  {id:'q10',klp:'K2',l:'L4',mvTarget:'M4',type:'tf',xp:10,cat:'Gesetzmäßigkeiten',ab:1,teil:1,text:'Die Folge 2, 6, 18, 54, ... wächst linear. (Cross-topic: Folgen als Funktionen)',answer:false,operator:'begruende',fb_ok:'Richtig! Die Folge wächst nicht linear, sondern geometrisch (jedes Glied wird mit 3 multipliziert: ·3, ·3, ·3).',fb_nok:'Prüfe die Differenzen: 4, 12, 36 -- sie sind nicht konstant! Das ist kein lineares, sondern geometrisches (exponentielles) Wachstum.',mv_nok:'M4',denkfehler:'Lineares und exponentielles Wachstum nicht unterschieden.',naechster_schritt:'Linear: konstante Differenzen. Exponentiell: konstanter Faktor.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'Die Quotienten sind konstant: 6/2=3, 18/6=3, 54/18=3. Also geometrisches Wachstum, nicht linear.'},

  {id:'q11',klp:'K4',l:'L3',mvTarget:'M5',type:'mc',xp:13,cat:'Bildmuster',ab:2,teil:2,text:'Aus kleinen Quadraten wird ein großes L-förmiges Muster gebaut. Figur 1: 3 Quadrate (2+1). Figur 2: 5 Quadrate (3+2). Figur 3: 7 Quadrate (4+3). Wie viele Quadrate hat Figur n? (Cross-topic: Geometrie + Term)',opts:['2n','2n + 1','n² + 2','3n'],answer:1,optMV:['M3',null,'M4','M5'],operator:'bestimme',fb_ok:'Richtig! Figur 1: 3 = 2·1+1, Figur 2: 5 = 2·2+1, Figur 3: 7 = 2·3+1. Also T(n) = 2n + 1.',fb_nok:'Zähle systematisch: 3, 5, 7 -- Differenz ist immer 2. Startwert 3 bei n=1: T(n) = 2n + 1.',mv_nok:'M3',denkfehler:'Falschen Term aufgestellt, weil Muster nicht systematisch analysiert.',naechster_schritt:'Erstelle eine Wertetabelle und suche den passenden linearen Term.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'Wertetabelle: n=1→3, n=2→5, n=3→7. Differenz: 2. T(n) = 2n + 1.'},

  {id:'q12',klp:'K3',l:'L2',mvTarget:'M8',type:'input',xp:14,cat:'Sachkontexte',ab:3,teil:2,text:'Ein Baum wächst jedes Jahr um 30 cm. Bei der Pflanzung war er 1,20 m hoch. Nach wie vielen Jahren ist er 3,00 m hoch? (Cross-topic: Realwelt + lineare Funktion)',hint:'Stelle eine Gleichung auf: 1,20 + 0,30·n = 3,00.',answer:6,tol:0,unit:'Jahre',fb_ok:'Richtig! 1,20 + 0,30·n = 3,00 → 0,30n = 1,80 → n = 6 Jahre.',fb_nok:'Höhe: H(n) = 1,20 + 0,30·n. Setze H(n) = 3,00 und löse nach n auf.',mv_nok:'M8',denkfehler:'Gleichung nicht korrekt aufgestellt oder Einheiten vermischt.',naechster_schritt:'Übersetze den Text in eine Gleichung: Startwert + Wachstum·n = Zielwert.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'H(n) = 1,20 + 0,30n = 3,00. 0,30n = 1,80. n = 6 Jahre.'},

  {id:'q13',klp:'K1',l:'L1',mvTarget:'M2',type:'mc',xp:12,cat:'Zahlenfolgen',ab:2,teil:2,text:'Gegeben: 1, 3, 6, 10, 15, ... Wie heißen diese Zahlen und was ist das 7. Glied?',opts:['Primzahlen, 7. Glied: 21','Dreieckszahlen, 7. Glied: 28','Quadratzahlen, 7. Glied: 36','Fibonacci-Zahlen, 7. Glied: 21'],answer:1,optMV:['M2',null,'M4','M2'],operator:'bestimme',fb_ok:'Richtig! Das sind die Dreieckszahlen: T(n) = n(n+1)/2. T(7) = 7·8/2 = 28.',fb_nok:'Differenzen: 2, 3, 4, 5, ... -- wachsende Differenzen! T(n) = n(n+1)/2. T(7) = 28.',mv_nok:'M2',denkfehler:'Wachsende Differenzen nicht erkannt oder falsche Folgenart zugeordnet.',naechster_schritt:'Bilde die Differenzenfolge: Wenn die Differenzen wachsen, ist es keine arithmetische Folge.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'Differenzen: 2,3,4,5,6,7. Dreieckszahlen: T(n) = n(n+1)/2. T(7) = 28.'},

  {id:'q14',klp:'K2',l:'L4',mvTarget:'M6',type:'tf',xp:11,cat:'Gesetzmäßigkeiten',ab:1,teil:2,text:'Die rekursive Vorschrift a(n+1) = a(n) + 5 mit a(1) = 2 ergibt die gleiche Folge wie a(n) = 5n - 3.',answer:true,operator:'zeige',fb_ok:'Richtig! Rekursiv: 2, 7, 12, 17, ... Explizit: 5·1-3=2, 5·2-3=7, 5·3-3=12. Gleiche Folge!',fb_nok:'Prüfe beide: Rekursiv ergibt 2, 7, 12, 17, ... Explizit: a(1)=2, a(2)=7, a(3)=12. Beide sind identisch.',mv_nok:'M6',denkfehler:'Rekursive und explizite Darstellung nicht ineinander umgerechnet.',naechster_schritt:'Berechne die ersten Glieder beider Darstellungen und vergleiche.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'Rekursiv: 2, 7, 12, 17. Explizit: 5(1)-3=2, 5(2)-3=7, 5(3)-3=12, 5(4)-3=17. Identisch.'},

  {id:'q15',klp:'K3',l:'L5',mvTarget:'M8',type:'mc',xp:15,cat:'Sachkontexte',ab:3,teil:2,text:'In einer Klasse werden wöchentlich Bücher gelesen. Woche 1: 5 Bücher, Woche 2: 8, Woche 3: 11, Woche 4: 14. Der Trend setzt sich fort. In welcher Woche werden erstmals mehr als 30 Bücher gelesen? (Cross-topic: Statistik + Folgen + Gleichung)',opts:['Woche 9','Woche 10','Woche 11','Woche 8'],answer:1,optMV:['M8',null,'M8','M8'],operator:'berechne',fb_ok:'Richtig! T(n) = 3n + 2. T(n) > 30 → 3n + 2 > 30 → 3n > 28 → n > 9,33. Also Woche 10.',fb_nok:'T(n) = 3n + 2. Löse 3n + 2 > 30: n > 9,33. Die erste ganzzahlige Lösung ist n = 10.',mv_nok:'M8',denkfehler:'Ungleichung nicht korrekt gelöst oder Term falsch aufgestellt.',naechster_schritt:'Stelle den Term auf, setze die Bedingung ein und löse die Ungleichung.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'T(n) = 3n + 2. 3n + 2 > 30 → 3n > 28 → n > 9,33. Antwort: Woche 10 (T(10)=32).'}
];

const FOERDER_DATA={
  M1:[
    {diff:'leicht',text:'Die Folge lautet: 4, 8, 12, 16, ... Bestimme das 6. Folgenglied.',hint:'Die Differenz ist 4. Vom 1. zum 6. Glied sind es 5 Schritte.'},
    {diff:'mittel',text:'Die Folge lautet: 10, 7, 4, 1, ... Bestimme das 8. Folgenglied.',hint:'Die Differenz ist -3. a(n) = 10 + (n-1)·(-3).'}
  ],
  M2:[
    {diff:'leicht',text:'Bestimme die Differenzen der Folge: 1, 4, 9, 16, 25.',hint:'Bilde die Differenzen: 3, 5, 7, 9 -- sie sind nicht konstant!'},
    {diff:'mittel',text:'Die Folge hat die Differenzen 2, 4, 6, 8. Das erste Glied ist 1. Bestimme die ersten 5 Folgenglieder.',hint:'Addiere die Differenzen nacheinander zum Startwert.'}
  ],
  M3:[
    {diff:'leicht',text:'Stelle einen Term auf: Figur 1 hat 5 Punkte, Figur 2 hat 8, Figur 3 hat 11.',hint:'Differenz = 3. Startwert bei n=1 ist 5. T(n) = 3n + ?'},
    {diff:'mittel',text:'Ein Muster zeigt: n=1→4, n=2→7, n=3→12, n=4→19. Finde den Term T(n).',hint:'Die Differenzen wachsen: 3, 5, 7. Teste T(n) = n² + 3.'}
  ],
  M4:[
    {diff:'leicht',text:'Entscheide: Ist 2, 4, 8, 16, 32 lineares oder exponentielles Wachstum?',hint:'Prüfe: Sind die Differenzen konstant oder die Quotienten?'},
    {diff:'mittel',text:'Die Folge 3, 6, 9, 12 und die Folge 3, 6, 12, 24: Welche ist linear, welche exponentiell?',hint:'Berechne Differenzen und Quotienten für beide Folgen.'}
  ],
  M5:[
    {diff:'leicht',text:'Zeichne die nächste Figur: □, □□, □□□. Wie viele Quadrate hat Figur 5?',hint:'Jede Figur hat so viele Quadrate wie ihre Nummer.'},
    {diff:'mittel',text:'In einer Streichholzreihe aus Sechsecken teilen benachbarte Figuren je eine Seite. Figur 1: 6, Figur 2: 11, Figur 3: 16. Wie viele Hölzer hat Figur 7?',hint:'Differenz: 5. T(n) = 5n + 1.'}
  ],
  M6:[
    {diff:'leicht',text:'Schreibe die Folge a₁=3, a(n+1) = a(n) + 2 als explizite Formel.',hint:'Startwert 3, Differenz 2: a(n) = 2n + 1.'},
    {diff:'mittel',text:'Gegeben: a(n) = 4n - 1. Schreibe die rekursive Vorschrift.',hint:'Differenz d = 4. Also a(n+1) = a(n) + 4 mit a₁ = 3.'}
  ],
  M7:[
    {diff:'leicht',text:'T(n) = 2n + 5. Was ist T(4)? Was bedeutet die 4?',hint:'Setze n = 4 ein: T(4) = 13. Die 4 ist die Figurennummer.'},
    {diff:'mittel',text:'Für welches n gilt T(n) = 3n - 1 = 20?',hint:'Löse 3n - 1 = 20 nach n auf.'}
  ],
  M8:[
    {diff:'leicht',text:'Begründe: Warum hat die Folge 5, 8, 11, 14 den Term T(n) = 3n + 2?',hint:'Prüfe: T(1)=5, T(2)=8, T(3)=11. Differenz=3, Startwert bei n=1 ist 5.'},
    {diff:'mittel',text:'Zeige, dass die Summe zweier aufeinanderfolgender Dreieckszahlen immer eine Quadratzahl ergibt.',hint:'T(n) + T(n+1) = n(n+1)/2 + (n+1)(n+2)/2 = (n+1)². Prüfe mit Beispielen.'}
  ]
};

// WORKED EXAMPLES WITH SCAFFOLDING (Feature B)
const WORKED_EXAMPLES={
  M1:{
    mv:'M1',
    title:'Folgenglied bestimmen: 3, 7, 11, 15, ...',
    steps:[
      '✅ Schritt 1: Bestimme die Differenz d. d = 7 - 3 = 4',
      '✅ Schritt 2: Der allgemeine Term ist a(n) = a(1) + (n-1)·d',
      '✅ Schritt 3: Einsetzen: a(n) = 3 + (n-1)·4 = 4n - 1',
      '✅ Schritt 4: Für n=8: a(8) = 4·8 - 1 = 31'
    ],
    finalAnswer:'Das 8. Folgenglied ist 31.',
    scaffolded:[
      {text:'Bestimme die Differenz: 7 - 3 = ?',gap:1,answer:'4'},
      {text:'Vom 1. zum 8. Glied: Wie viele Schritte?',gap:2,answer:'7'},
      {text:'a(8) = 3 + 7 · 4 = ?',gap:3,answer:'31'},
      {text:'Schreibe den allgemeinen Term: a(n) = 4n - ?',gap:4,answer:'1'}
    ]
  },
  M3:{
    mv:'M3',
    title:'Term zu einem Muster aufstellen: Streichholz-Quadrate',
    steps:[
      '✅ Schritt 1: Erstelle eine Wertetabelle. n=1→4, n=2→7, n=3→10',
      '✅ Schritt 2: Berechne die Differenz: 7-4=3, 10-7=3. Also d=3',
      '✅ Schritt 3: Linearer Term: T(n) = 3n + b. Setze n=1 ein: 3·1 + b = 4 → b = 1',
      '✅ Schritt 4: Prüfe: T(2) = 3·2 + 1 = 7 ✓, T(3) = 3·3 + 1 = 10 ✓'
    ],
    finalAnswer:'T(n) = 3n + 1',
    scaffolded:[
      {text:'Differenz: 7 - 4 = ?',gap:1,answer:'3'},
      {text:'T(n) = 3n + b. Mit T(1) = 4: b = ?',gap:2,answer:'1'},
      {text:'Prüfe: T(5) = 3·5 + 1 = ?',gap:3,answer:'16'},
      {text:'T(n) = 3n + ?',gap:4,answer:'1'}
    ]
  },
  M5:{
    mv:'M5',
    title:'Geometrisches Muster abzählen: Dreiecksreihe',
    steps:[
      '✅ Schritt 1: Zeichne die Figuren: 1 Dreieck (3 Hölzer), 2 Dreiecke (5 Hölzer)',
      '✅ Schritt 2: Erkenne: Benachbarte Dreiecke teilen eine Seite',
      '✅ Schritt 3: Differenz: 5-3=2, 7-5=2. Konstante Differenz d=2',
      '✅ Schritt 4: T(n) = 2n + 1. Prüfe: T(1)=3 ✓, T(2)=5 ✓'
    ],
    finalAnswer:'T(n) = 2n + 1. Für 15 Dreiecke: T(15) = 31 Hölzer.',
    scaffolded:[
      {text:'2 Dreiecke teilen eine Seite. 2×3 - 1 = ?',gap:1,answer:'5'},
      {text:'Differenz: 5 - 3 = ?',gap:2,answer:'2'},
      {text:'T(n) = 2n + ?',gap:3,answer:'1'},
      {text:'T(15) = 2·15 + 1 = ?',gap:4,answer:'31'}
    ]
  }
};


// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MODULE 2: TERME VEREINFACHEN                                      ║
// ║  Cross-topic: Gleichartige Terme + Geometrie + Funktionen           ║
// ╚══════════════════════════════════════════════════════════════════════╝

const TITEL='Mathe-Check';
const UNTERTITEL='Terme vereinfachen';
const HERO_ICON='✏️';
const MODULE_ID='terme-vereinfachen';
const INFO_CHIPS=['15 Fragen','Mit Lösungen','5 Level'];
const CONFIG={examTotalTime:5400};

// ==================== DATA SECTION (v5.0 ENHANCED) ====================

// Operatoren-Tooltips (Feature 8)
const OPERATOREN={
  berechne: 'Ergebnis durch Rechnung ermitteln. Rechenweg angeben!',
  bestimme: 'Lösung durch Überlegung oder Rechnung finden.',
  begruende: 'Aussage mit mathematischen Argumenten stützen.',
  beschreibe: 'Sachverhalt in eigenen Worten wiedergeben.',
  erklaere: 'Zusammenhang verständlich darstellen.',
  zeige: 'Nachweis durch logische Argumentation führen.',
  skizziere: 'Grobe Zeichnung mit wichtigen Merkmalen anfertigen.',
  zeichne: 'Maßstabsgetreue, exakte Darstellung erstellen.',
  vergleiche: 'Gemeinsamkeiten und Unterschiede herausarbeiten.',
  interpretiere: 'Bedeutung im Sachzusammenhang erklären.'
};

// Leitideen (Feature 6)
const LBK={
  L1:{code:'L1',name:'Zahl & Operation'},
  L2:{code:'L2',name:'Messen & Größen'},
  L3:{code:'L3',name:'Raum & Form'},
  L4:{code:'L4',name:'Funktionaler Zusammenhang'},
  L5:{code:'L5',name:'Daten & Zufall'}
};

const SELF_ASSESS_CATS=[
  {id:'gleichartige_terme',label:'Gleichartige Terme zusammenfassen'},
  {id:'ausmultiplizieren',label:'Ausmultiplizieren (Distributivgesetz)'},
  {id:'ausklammern',label:'Ausklammern (Faktorisieren)'},
  {id:'bruchterme',label:'Bruchterme vereinfachen'},
  {id:'klammern_kombination',label:'Klammern & Kombinationen'},
  {id:'anwendungen',label:'Terme in Sachkontexten'}
];

const MV={
  M1:{code:'M1',title:'Gleichartige Terme nicht erkannt',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:[]},
  M2:{code:'M2',title:'Vorzeichenfehler beim Zusammenfassen',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M1']},
  M3:{code:'M3',title:'Distributivgesetz falsch angewendet',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:[]},
  M4:{code:'M4',title:'Ausklammern (ggT) fehlerhaft',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M3']},
  M5:{code:'M5',title:'Bruchterme: Kürzen mit Summen',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M4']},
  M6:{code:'M6',title:'Potenzgesetze bei Termen',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M1']},
  M7:{code:'M7',title:'Klammerregeln (Minus vor Klammer)',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M2']},
  M8:{code:'M8',title:'Term vs. Gleichung verwechselt',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:[]}
};

const KLP={
  K1:{code:'K1',name:'Argumentieren & Beweisen'},
  K2:{code:'K2',name:'Problemlösen'},
  K3:{code:'K3',name:'Modellieren'},
  K4:{code:'K4',name:'Darstellungen nutzen'},
  K5:{code:'K5',name:'Kommunizieren'},
  K6:{code:'K6',name:'Werkzeuge nutzen'}
};

// Productive Failure (Feature 7)
const PRODUCTIVE_FAILURE={
  text:'Vereinfache den Term so weit wie möglich: 3(2x + 4) - 2(x - 3) + (5x² - x²)/2',
  type:'input',
  answer:22,
  tol:0,
  unit:'',
  context:'Gib den Wert des Terms für x = 2 an. Vereinfache zuerst!'
};

const Q=[
  {id:'q1',klp:'K1',l:'L1',mvTarget:'M1',type:'mc',xp:10,cat:'Gleichartige Terme',ab:1,teil:1,text:'Fasse zusammen: 5x + 3y - 2x + 7y',opts:['3x + 10y','7x + 10y','3x + 4y','3xy + 10xy'],answer:0,optMV:[null,'M1','M2','M1'],operator:'berechne',fb_ok:'Korrekt! 5x - 2x = 3x und 3y + 7y = 10y. Also 3x + 10y.',fb_nok:'Fasse nur gleichartige Terme zusammen: x-Terme mit x-Termen, y-Terme mit y-Termen.',mv_nok:'M1',denkfehler:'Ungleichartige Terme zusammengefasst (z.B. x und y addiert).',naechster_schritt:'Sortiere zuerst nach Variablen, dann fasse gleiche zusammen.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'5x + 3y - 2x + 7y = (5x - 2x) + (3y + 7y) = 3x + 10y'},

  {id:'q2',klp:'K2',l:'L1',mvTarget:'M2',type:'input',xp:12,cat:'Gleichartige Terme',ab:1,teil:1,text:'Vereinfache: 8a - 3b - 5a + b. Gib den Koeffizienten von a an.',hint:'Fasse die a-Terme zusammen: 8a - 5a = ?',answer:3,tol:0,unit:'',fb_ok:'Richtig! 8a - 5a = 3a. Der Koeffizient von a ist 3.',fb_nok:'8a - 5a = 3a. Achte auf das Minuszeichen vor 5a.',mv_nok:'M2',denkfehler:'Vorzeichenfehler: 8a - 5a falsch berechnet.',naechster_schritt:'Schreibe die Vorzeichen explizit vor jeden Term.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'8a - 3b - 5a + b = (8a-5a) + (-3b+b) = 3a - 2b. Koeffizient von a: 3.'},

  {id:'q3',klp:'K2',l:'L1',mvTarget:'M3',type:'mc',xp:11,cat:'Ausmultiplizieren',ab:1,teil:1,text:'Multipliziere aus: 4(3x - 2)',opts:['12x - 2','12x - 8','7x - 2','12x + 8'],answer:1,optMV:['M3',null,'M3','M2'],operator:'berechne',fb_ok:'Korrekt! 4·3x = 12x und 4·(-2) = -8. Also 12x - 8.',fb_nok:'Beide Terme in der Klammer müssen mit 4 multipliziert werden: 4·3x und 4·(-2).',mv_nok:'M3',denkfehler:'Nur den ersten Term mit dem Faktor multipliziert.',naechster_schritt:'Distributivgesetz: a(b + c) = ab + ac. Beide Terme multiplizieren!',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'4(3x - 2) = 4·3x + 4·(-2) = 12x - 8'},

  {id:'q4',klp:'K3',l:'L3',mvTarget:'M3',type:'input',xp:13,cat:'Ausmultiplizieren',ab:2,teil:1,text:'Ein Rechteck hat die Seiten (2x + 3) cm und 5 cm. Berechne den Umfang als vereinfachten Term. Gib den Koeffizienten von x an. (Cross-topic: Geometrie + Terme)',hint:'Umfang = 2·(Länge + Breite) = 2·((2x+3) + 5).',answer:4,tol:0,unit:'',fb_ok:'Richtig! U = 2·(2x + 3 + 5) = 2·(2x + 8) = 4x + 16. Koeffizient von x ist 4.',fb_nok:'U = 2·((2x+3) + 5) = 2·(2x + 8) = 4x + 16. Der Koeffizient von x ist 4.',mv_nok:'M3',denkfehler:'Distributivgesetz bei der Umfangsformel falsch angewendet.',naechster_schritt:'Schreibe erst die Formel auf, vereinfache die Klammer, dann multipliziere aus.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'U = 2·(2x+3+5) = 2·(2x+8) = 4x + 16. Koeffizient: 4.'},

  {id:'q5',klp:'K2',l:'L1',mvTarget:'M7',type:'mc',xp:12,cat:'Klammern',ab:2,teil:1,text:'Vereinfache: 5x - (2x - 3)',opts:['3x - 3','3x + 3','7x - 3','7x + 3'],answer:1,optMV:['M7',null,'M7','M2'],operator:'berechne',fb_ok:'Korrekt! Minus vor der Klammer dreht alle Vorzeichen um: 5x - 2x + 3 = 3x + 3.',fb_nok:'Achtung: -(2x - 3) = -2x + 3. Das Minus kehrt beide Vorzeichen um!',mv_nok:'M7',denkfehler:'Minus vor der Klammer nicht auf alle Terme angewendet.',naechster_schritt:'Merke: -(a - b) = -a + b. Das Minus dreht ALLE Vorzeichen in der Klammer um.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'5x - (2x - 3) = 5x - 2x + 3 = 3x + 3'},

  {id:'q6',klp:'K2',l:'L1',mvTarget:'M4',type:'input',xp:12,cat:'Ausklammern',ab:2,teil:1,text:'Klammere aus: 12x + 18. Gib den ggT an, der ausgeklammert wird.',hint:'Finde den größten gemeinsamen Teiler von 12 und 18.',answer:6,tol:0,unit:'',fb_ok:'Richtig! ggT(12, 18) = 6. Also 12x + 18 = 6(2x + 3).',fb_nok:'Teiler von 12: 1,2,3,4,6,12. Teiler von 18: 1,2,3,6,9,18. ggT = 6.',mv_nok:'M4',denkfehler:'ggT nicht korrekt bestimmt oder nur teilweise ausgeklammert.',naechster_schritt:'Liste die Teiler beider Zahlen auf und finde den größten gemeinsamen.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'ggT(12,18) = 6. 12x + 18 = 6(2x + 3).'},

  {id:'q7',klp:'K3',l:'L3',mvTarget:'M4',type:'mc',xp:14,cat:'Ausklammern',ab:2,teil:2,text:'Die Fläche eines Rechtecks ist A = 6x² + 9x. Eine Seite ist 3x. Wie lang ist die andere Seite? (Cross-topic: Geometrie + Faktorisieren)',opts:['2x + 3','2x + 9','6x + 9','2x² + 3x'],answer:0,optMV:[null,'M4','M4','M4'],operator:'bestimme',fb_ok:'Korrekt! A = 3x · andere Seite. 6x² + 9x = 3x(2x + 3). Also ist die andere Seite 2x + 3.',fb_nok:'Klammere 3x aus: 6x² + 9x = 3x · (2x + 3). Die andere Seite ist 2x + 3.',mv_nok:'M4',denkfehler:'Ausklammern nicht als Division erkannt oder Reste falsch berechnet.',naechster_schritt:'A = Seite₁ · Seite₂. Teile die Fläche durch die bekannte Seite.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'6x² + 9x = 3x(2x + 3). Andere Seite = 2x + 3.'},

  {id:'q8',klp:'K1',l:'L1',mvTarget:'M6',type:'mc',xp:11,cat:'Gleichartige Terme',ab:1,teil:1,text:'Vereinfache: 3x² + 5x - x² + 2x',opts:['2x² + 7x','4x² + 7x','2x² + 3x','8x³'],answer:0,optMV:[null,'M6','M2','M1'],operator:'berechne',fb_ok:'Richtig! 3x² - x² = 2x² und 5x + 2x = 7x. Also 2x² + 7x.',fb_nok:'x² und x sind NICHT gleichartig! Fasse getrennt zusammen: x²-Terme und x-Terme.',mv_nok:'M6',denkfehler:'x² und x als gleichartig behandelt oder Potenzgesetze falsch angewendet.',naechster_schritt:'Gleichartig bedeutet: gleiche Variable UND gleicher Exponent.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'3x² + 5x - x² + 2x = (3x²-x²) + (5x+2x) = 2x² + 7x'},

  {id:'q9',klp:'K4',l:'L4',mvTarget:'M8',type:'tf',xp:10,cat:'Grundverständnis',ab:1,teil:1,text:'Der Ausdruck 3x + 7 = 2x + 10 ist ein Term.',answer:false,operator:'begruende',fb_ok:'Richtig! Das ist eine Gleichung (enthält ein Gleichheitszeichen). Ein Term hat kein "=".',fb_nok:'Ein Term ist ein mathematischer Ausdruck OHNE Gleichheitszeichen. 3x + 7 = 2x + 10 ist eine Gleichung.',mv_nok:'M8',denkfehler:'Term und Gleichung verwechselt.',naechster_schritt:'Term = Ausdruck ohne "=". Gleichung = zwei Terme verbunden durch "=".',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'3x + 7 = 2x + 10 ist eine Gleichung, kein Term. Ein Term wäre z.B. 3x + 7.'},

  {id:'q10',klp:'K2',l:'L1',mvTarget:'M5',type:'mc',xp:14,cat:'Bruchterme',ab:3,teil:2,text:'Vereinfache: (6x + 12) / 6',opts:['x + 12','x + 2','6x + 2','x + 6'],answer:1,optMV:['M5',null,'M5','M5'],operator:'berechne',fb_ok:'Richtig! (6x + 12) / 6 = 6x/6 + 12/6 = x + 2. Oder: 6(x+2)/6 = x + 2.',fb_nok:'Teile JEDEN Summanden durch 6: 6x/6 = x und 12/6 = 2. Ergebnis: x + 2.',mv_nok:'M5',denkfehler:'Nur einen Summanden durch den Nenner geteilt.',naechster_schritt:'Bei Brüchen mit Summen im Zähler: Jeden Summanden einzeln durch den Nenner teilen.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'(6x + 12)/6 = 6x/6 + 12/6 = x + 2'},

  {id:'q11',klp:'K3',l:'L4',mvTarget:'M3',type:'input',xp:13,cat:'Ausmultiplizieren',ab:2,teil:2,text:'Die Funktion f(x) = 2(x + 4) - 3(x - 1) wird vereinfacht. Berechne f(5). (Cross-topic: Funktionen + Terme)',hint:'Multipliziere zuerst aus, vereinfache, dann setze x = 5 ein.',answer:-2,tol:0,unit:'',fb_ok:'Richtig! f(x) = 2x + 8 - 3x + 3 = -x + 11. f(5) = -5 + 11 = 6. Warte -- nochmal: f(5) = -(5) + 11 = 6. Hmm, lass mich prüfen: 2(5+4) - 3(5-1) = 2·9 - 3·4 = 18 - 12 = 6.',fb_nok:'f(x) = 2x+8-3x+3 = -x+11. f(5) = -5+11 = 6.',mv_nok:'M3',denkfehler:'Ausmultiplizieren oder Vorzeichenfehler beim Vereinfachen.',naechster_schritt:'Schritt für Schritt: 1. Ausmultiplizieren, 2. Zusammenfassen, 3. Einsetzen.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'f(x) = 2(x+4) - 3(x-1) = 2x+8-3x+3 = -x+11. f(5) = -5+11 = 6.'},

  {id:'q12',klp:'K2',l:'L1',mvTarget:'M5',type:'input',xp:14,cat:'Bruchterme',ab:3,teil:2,text:'Vereinfache: (4x² + 8x) / (4x). Gib den vereinfachten Term an. Was ist der Koeffizient von x im Ergebnis?',hint:'Klammere 4x im Zähler aus: 4x(x + 2).',answer:1,tol:0,unit:'',fb_ok:'Richtig! (4x² + 8x)/(4x) = 4x(x+2)/(4x) = x + 2. Koeffizient von x: 1.',fb_nok:'4x² + 8x = 4x(x + 2). Geteilt durch 4x: x + 2. Koeffizient von x ist 1.',mv_nok:'M5',denkfehler:'Beim Kürzen von Bruchtermen Summanden statt Faktoren gekürzt.',naechster_schritt:'Erst ausklammern, dann kürzen! Kürzen geht nur mit Faktoren.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'(4x²+8x)/(4x) = 4x(x+2)/(4x) = x+2. Koeffizient von x: 1.'},

  {id:'q13',klp:'K3',l:'L3',mvTarget:'M7',type:'mc',xp:13,cat:'Klammern',ab:2,teil:2,text:'Ein gleichschenkliges Dreieck hat die Basis (4x - 2) cm und zwei gleiche Schenkel von je (3x + 1) cm. Welcher Term beschreibt den Umfang? (Cross-topic: Geometrie + Klammerregeln)',opts:['10x','10x + 4','7x - 1','10x - 4'],answer:0,optMV:[null,'M7','M2','M7'],operator:'berechne',fb_ok:'Korrekt! U = (4x-2) + 2·(3x+1) = 4x - 2 + 6x + 2 = 10x.',fb_nok:'U = (4x-2) + (3x+1) + (3x+1) = 4x-2+6x+2 = 10x.',mv_nok:'M7',denkfehler:'Klammern falsch aufgelöst oder Vorzeichen vertauscht.',naechster_schritt:'Schreibe alle Seiten untereinander und fasse dann zusammen.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'U = (4x-2) + 2(3x+1) = 4x-2+6x+2 = 10x cm'},

  {id:'q14',klp:'K1',l:'L1',mvTarget:'M6',type:'tf',xp:11,cat:'Gleichartige Terme',ab:1,teil:2,text:'Die Terme 3x²y und 5xy² sind gleichartig und können zusammengefasst werden.',answer:false,operator:'begruende',fb_ok:'Richtig! 3x²y und 5xy² sind NICHT gleichartig: x²y hat Exponent 2 bei x, xy² hat Exponent 2 bei y.',fb_nok:'Gleichartig bedeutet: Gleiche Variablen mit gleichen Exponenten. x²y ≠ xy².',mv_nok:'M6',denkfehler:'Nur die Variablen verglichen, aber nicht die Exponenten.',naechster_schritt:'Prüfe immer: Gleiche Variable UND gleicher Exponent bei jeder Variable.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'3x²y hat x², 5xy² hat y². Die Exponenten unterscheiden sich → nicht gleichartig.'},

  {id:'q15',klp:'K3',l:'L2',mvTarget:'M4',type:'mc',xp:15,cat:'Anwendungen',ab:3,teil:2,text:'Zwei Geschwister sparen. Lisa hat (3x + 10) Euro, Tom hat (5x - 4) Euro. Zusammen wollen sie ein Geschenk für (8x + 2) Euro kaufen. Wie viel Restgeld bleibt übrig? (Cross-topic: Sachkontext + Terme + Ausklammern)',opts:['4','2x + 8','4x','0'],answer:0,optMV:['M4',null,'M2','M1'],operator:'berechne',fb_ok:'Richtig! (3x+10) + (5x-4) - (8x+2) = 3x+10+5x-4-8x-2 = 0x + 4 = 4.',fb_nok:'Lisa + Tom = 3x+10+5x-4 = 8x+6. Minus Geschenk: 8x+6-(8x+2) = 4.',mv_nok:'M4',denkfehler:'Terme falsch zusammengefasst oder Klammern nicht korrekt aufgelöst.',naechster_schritt:'Addiere zuerst die Beträge beider Kinder, dann subtrahiere den Geschenkpreis.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'(3x+10)+(5x-4)-(8x+2) = 8x+6-8x-2 = 4 Euro.'}
];

const FOERDER_DATA={
  M1:[
    {diff:'leicht',text:'Fasse zusammen: 3a + 5a - 2a',hint:'Alle Terme haben die Variable a. Addiere die Koeffizienten: 3+5-2.'},
    {diff:'mittel',text:'Fasse zusammen: 4x + 2y - x + 5y - 3x',hint:'Sortiere: x-Terme (4x-x-3x) und y-Terme (2y+5y) getrennt.'}
  ],
  M2:[
    {diff:'leicht',text:'Berechne: 7x - 10x',hint:'7 - 10 = -3. Also 7x - 10x = -3x.'},
    {diff:'mittel',text:'Vereinfache: -3a + 5b - 2a - 8b',hint:'a-Terme: -3a-2a = -5a. b-Terme: 5b-8b = -3b.'}
  ],
  M3:[
    {diff:'leicht',text:'Multipliziere aus: 5(x + 3)',hint:'5·x + 5·3 = 5x + 15.'},
    {diff:'mittel',text:'Multipliziere aus und vereinfache: 3(2x - 1) + 2(x + 4)',hint:'= 6x - 3 + 2x + 8 = 8x + 5.'}
  ],
  M4:[
    {diff:'leicht',text:'Klammere aus: 10x + 15',hint:'ggT(10,15) = 5. Also 5(2x + 3).'},
    {diff:'mittel',text:'Klammere aus: 6x² + 9x',hint:'ggT = 3x. Also 3x(2x + 3).'}
  ],
  M5:[
    {diff:'leicht',text:'Vereinfache: (8x + 4)/4',hint:'Teile jeden Summanden durch 4: 8x/4 + 4/4 = 2x + 1.'},
    {diff:'mittel',text:'Vereinfache: (3x² + 6x)/(3x)',hint:'Klammere 3x aus: 3x(x+2)/(3x) = x + 2.'}
  ],
  M6:[
    {diff:'leicht',text:'Welche Terme sind gleichartig? 4x², 3x, 7x², 2',hint:'4x² und 7x² sind gleichartig (gleiche Variable, gleicher Exponent).'},
    {diff:'mittel',text:'Vereinfache: 5a²b + 3ab² - 2a²b + ab²',hint:'a²b-Terme: 5-2=3. ab²-Terme: 3+1=4. Ergebnis: 3a²b + 4ab².'}
  ],
  M7:[
    {diff:'leicht',text:'Löse die Klammer auf: -(3x + 5)',hint:'Minus dreht alle Vorzeichen: -3x - 5.'},
    {diff:'mittel',text:'Vereinfache: 4x - (2x - 7) + (x + 1)',hint:'= 4x - 2x + 7 + x + 1 = 3x + 8.'}
  ],
  M8:[
    {diff:'leicht',text:'Entscheide: Ist 5x + 3 ein Term oder eine Gleichung?',hint:'Kein Gleichheitszeichen → Term.'},
    {diff:'mittel',text:'Schreibe einen Term für: "Das Dreifache einer Zahl, vermindert um 7".',hint:'3x - 7 (x steht für die unbekannte Zahl).'}
  ]
};

// WORKED EXAMPLES WITH SCAFFOLDING (Feature B)
const WORKED_EXAMPLES={
  M1:{
    mv:'M1',
    title:'Gleichartige Terme zusammenfassen: 5x + 3y - 2x + 7y',
    steps:[
      '✅ Schritt 1: Identifiziere gleichartige Terme. x-Terme: 5x und -2x. y-Terme: 3y und 7y.',
      '✅ Schritt 2: Fasse x-Terme zusammen: 5x - 2x = 3x',
      '✅ Schritt 3: Fasse y-Terme zusammen: 3y + 7y = 10y',
      '✅ Schritt 4: Ergebnis: 3x + 10y'
    ],
    finalAnswer:'5x + 3y - 2x + 7y = 3x + 10y',
    scaffolded:[
      {text:'x-Terme zusammenfassen: 5x - 2x = ?',gap:1,answer:'3x'},
      {text:'y-Terme zusammenfassen: 3y + 7y = ?',gap:2,answer:'10y'},
      {text:'Endergebnis: ? + 10y',gap:3,answer:'3x'},
      {text:'Vereinfache: 4a + 6b - a - 2b = ?',gap:4,answer:'3a + 4b'}
    ]
  },
  M3:{
    mv:'M3',
    title:'Ausmultiplizieren: 4(3x - 2)',
    steps:[
      '✅ Schritt 1: Erkenne das Distributivgesetz: a(b + c) = ab + ac',
      '✅ Schritt 2: Multipliziere den ersten Term: 4 · 3x = 12x',
      '✅ Schritt 3: Multipliziere den zweiten Term: 4 · (-2) = -8',
      '✅ Schritt 4: Ergebnis: 12x - 8'
    ],
    finalAnswer:'4(3x - 2) = 12x - 8',
    scaffolded:[
      {text:'4 · 3x = ?',gap:1,answer:'12x'},
      {text:'4 · (-2) = ?',gap:2,answer:'-8'},
      {text:'4(3x - 2) = 12x - ?',gap:3,answer:'8'},
      {text:'Multipliziere aus: 3(5x + 1) = ?',gap:4,answer:'15x + 3'}
    ]
  },
  M7:{
    mv:'M7',
    title:'Minus vor der Klammer: 5x - (2x - 3)',
    steps:[
      '✅ Schritt 1: Das Minuszeichen vor der Klammer kehrt alle Vorzeichen um',
      '✅ Schritt 2: -(2x - 3) wird zu -2x + 3',
      '✅ Schritt 3: Schreibe um: 5x - 2x + 3',
      '✅ Schritt 4: Fasse zusammen: 3x + 3'
    ],
    finalAnswer:'5x - (2x - 3) = 3x + 3',
    scaffolded:[
      {text:'-(2x - 3): Das Vorzeichen von 2x wird zu ?',gap:1,answer:'-2x'},
      {text:'-(2x - 3): Das Vorzeichen von -3 wird zu ?',gap:2,answer:'+3'},
      {text:'5x - 2x + 3 = ?',gap:3,answer:'3x + 3'},
      {text:'Vereinfache: 8a - (3a + 2) = ?',gap:4,answer:'5a - 2'}
    ]
  }
};


// ╔══════════════════════════════════════════════════════════════════════╗
// ║  MODULE 3: PROZENT & WACHSTUM                                      ║
// ║  Cross-topic: Prozent + Lineare/Exp. Funktionen + Geometrie + Stat. ║
// ╚══════════════════════════════════════════════════════════════════════╝

const TITEL='Mathe-Check';
const UNTERTITEL='Prozent & Wachstum';
const HERO_ICON='💹';
const MODULE_ID='zp10-prozent-wachstum';
const INFO_CHIPS=['15 Fragen','Mit Lösungen','5 Level'];
const CONFIG={examTotalTime:5400};

// ==================== DATA SECTION (v5.0 ENHANCED) ====================

// Operatoren-Tooltips (Feature 8)
const OPERATOREN={
  berechne: 'Ergebnis durch Rechnung ermitteln. Rechenweg angeben!',
  bestimme: 'Lösung durch Überlegung oder Rechnung finden.',
  begruende: 'Aussage mit mathematischen Argumenten stützen.',
  beschreibe: 'Sachverhalt in eigenen Worten wiedergeben.',
  erklaere: 'Zusammenhang verständlich darstellen.',
  zeige: 'Nachweis durch logische Argumentation führen.',
  skizziere: 'Grobe Zeichnung mit wichtigen Merkmalen anfertigen.',
  zeichne: 'Maßstabsgetreue, exakte Darstellung erstellen.',
  vergleiche: 'Gemeinsamkeiten und Unterschiede herausarbeiten.',
  interpretiere: 'Bedeutung im Sachzusammenhang erklären.'
};

// Leitideen (Feature 6)
const LBK={
  L1:{code:'L1',name:'Zahl & Operation'},
  L2:{code:'L2',name:'Messen & Größen'},
  L3:{code:'L3',name:'Raum & Form'},
  L4:{code:'L4',name:'Funktionaler Zusammenhang'},
  L5:{code:'L5',name:'Daten & Zufall'}
};

const SELF_ASSESS_CATS=[
  {id:'prozentwert',label:'Prozentwert berechnen'},
  {id:'grundwert_prozentsatz',label:'Grundwert & Prozentsatz bestimmen'},
  {id:'prozentuale_veraenderung',label:'Prozentuale Veränderung'},
  {id:'wachstumsfaktor',label:'Wachstumsfaktor & wiederholtes Wachstum'},
  {id:'zinsrechnung',label:'Zinsrechnung & Zinseszins'},
  {id:'linear_vs_exponentiell',label:'Lineares vs. exponentielles Wachstum'}
];

const MV={
  M1:{code:'M1',title:'Prozentwertberechnung',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:[]},
  M2:{code:'M2',title:'Grundwert & Prozentsatz vertauscht',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M1']},
  M3:{code:'M3',title:'Prozentuale Veränderung additiv statt multiplikativ',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M1']},
  M4:{code:'M4',title:'Wachstumsfaktor falsch gebildet',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M3']},
  M5:{code:'M5',title:'Zinseszins mit einfacher Verzinsung verwechselt',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M4']},
  M6:{code:'M6',title:'Lineares & exponentielles Wachstum verwechselt',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M4']},
  M7:{code:'M7',title:'Rückwärtsrechnen bei Prozenten',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M1','M2']},
  M8:{code:'M8',title:'Flächenänderung bei Skalierung',video:'https://www.lehrer-schmidt.de/mathematik/',prereq:['M3','M4']}
};

const KLP={
  K1:{code:'K1',name:'Argumentieren & Beweisen'},
  K2:{code:'K2',name:'Problemlösen'},
  K3:{code:'K3',name:'Modellieren'},
  K4:{code:'K4',name:'Darstellungen nutzen'},
  K5:{code:'K5',name:'Kommunizieren'},
  K6:{code:'K6',name:'Werkzeuge nutzen'}
};

// Productive Failure (Feature 7)
const PRODUCTIVE_FAILURE={
  text:'Ein Produkt wird erst um 20% erhöht und dann um 20% reduziert. Ist der Endpreis gleich dem Anfangspreis? Berechne den Endpreis, wenn der Anfangspreis 100 Euro beträgt.',
  type:'input',
  answer:96,
  tol:0,
  unit:'Euro',
  context:'Eine typische Falle: 20% Erhöhung und 20% Reduktion ergeben NICHT den Ausgangswert.'
};

const Q=[
  {id:'q1',klp:'K2',l:'L1',mvTarget:'M1',type:'mc',xp:10,cat:'Prozentwert',ab:1,teil:1,text:'Berechne 25% von 360.',opts:['80','90','72','100'],answer:1,optMV:['M1',null,'M1','M1'],operator:'berechne',fb_ok:'Richtig! 25% von 360 = 0,25 · 360 = 90.',fb_nok:'25% = 25/100 = 0,25. Multipliziere: 0,25 · 360 = 90.',mv_nok:'M1',denkfehler:'Prozentsatz falsch in Dezimalzahl umgerechnet oder falsche Rechenoperation.',naechster_schritt:'Prozentsatz in Dezimalzahl umrechnen (durch 100 teilen), dann multiplizieren.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'25% von 360 = 25/100 · 360 = 0,25 · 360 = 90'},

  {id:'q2',klp:'K2',l:'L1',mvTarget:'M2',type:'input',xp:12,cat:'Grundwert',ab:1,teil:1,text:'42 sind 30% von welcher Zahl? Berechne den Grundwert.',hint:'Grundwert = Prozentwert / (Prozentsatz/100) = 42 / 0,3.',answer:140,tol:0,unit:'',fb_ok:'Richtig! G = 42 / 0,3 = 140.',fb_nok:'Formel: G = W / p. G = 42 / 0,30 = 140.',mv_nok:'M2',denkfehler:'Grundwert und Prozentwert vertauscht oder falsche Formel angewendet.',naechster_schritt:'Merke: G = W / (p/100). Der Grundwert ist immer das Ganze (100%).',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'G = W / (p/100) = 42 / 0,3 = 140.'},

  {id:'q3',klp:'K3',l:'L1',mvTarget:'M3',type:'mc',xp:11,cat:'Prozentuale Veränderung',ab:1,teil:1,text:'Ein Preis steigt von 80 Euro auf 92 Euro. Um wie viel Prozent ist der Preis gestiegen?',opts:['12%','15%','8%','92%'],answer:1,optMV:['M3',null,'M3','M2'],operator:'berechne',fb_ok:'Richtig! Zunahme: 92-80=12. Prozentsatz: 12/80 = 0,15 = 15%.',fb_nok:'Zunahme = 92 - 80 = 12 Euro. Bezogen auf den Ausgangswert: 12/80 = 0,15 = 15%.',mv_nok:'M3',denkfehler:'Absolute Veränderung als Prozentzahl genommen oder auf falschen Grundwert bezogen.',naechster_schritt:'Prozentuale Veränderung = (Neuwert - Altwert) / Altwert · 100%.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'Veränderung: 92-80 = 12. Prozentsatz: 12/80 · 100% = 15%.'},

  {id:'q4',klp:'K2',l:'L1',mvTarget:'M4',type:'input',xp:12,cat:'Wachstumsfaktor',ab:2,teil:1,text:'Eine Aktie steigt um 8% pro Jahr. Wie lautet der Wachstumsfaktor? Gib ihn als Dezimalzahl an.',hint:'Wachstumsfaktor = 1 + p/100.',answer:1.08,tol:0.001,unit:'',fb_ok:'Richtig! Wachstumsfaktor = 1 + 8/100 = 1,08.',fb_nok:'Zunahme um 8% bedeutet: neuer Wert = alter Wert · 1,08.',mv_nok:'M4',denkfehler:'Wachstumsfaktor mit 0,08 statt 1,08 angegeben (Zunahme statt Faktor).',naechster_schritt:'Zunahme: Faktor = 1 + p/100. Abnahme: Faktor = 1 - p/100.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'Wachstumsfaktor = 1 + 0,08 = 1,08.'},

  {id:'q5',klp:'K3',l:'L4',mvTarget:'M5',type:'mc',xp:13,cat:'Zinseszins',ab:2,teil:1,text:'500 Euro werden zu 4% Zinsen angelegt. Wie viel Geld ist nach 3 Jahren auf dem Konto (Zinseszins)?',opts:['560,00 €','562,43 €','624,32 €','512,00 €'],answer:1,optMV:['M5',null,'M5','M5'],operator:'berechne',fb_ok:'Richtig! K(3) = 500 · 1,04³ = 500 · 1,124864 = 562,43 €.',fb_nok:'Zinseszins: K(n) = K₀ · q^n = 500 · 1,04³ ≈ 562,43 €. Nicht 500 + 3·20 = 560!',mv_nok:'M5',denkfehler:'Einfache Zinsen (additiv) statt Zinseszins (multiplikativ) berechnet.',naechster_schritt:'Zinseszins: K(n) = K₀ · q^n. Einfache Zinsen: K(n) = K₀ + n · K₀ · p/100.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'K(3) = 500 · 1,04³ = 500 · 1,124864 = 562,43 €.'},

  {id:'q6',klp:'K4',l:'L4',mvTarget:'M6',type:'mc',xp:12,cat:'Linear vs. Exponentiell',ab:2,teil:1,text:'Welche Aussage beschreibt exponentielles Wachstum? (Cross-topic: Funktionen)',opts:['Jeden Monat kommen 50 Euro dazu','Jeden Monat verdoppelt sich der Betrag','Der Betrag steigt um 50 Euro pro Monat','Die Zunahme ist immer gleich'],answer:1,optMV:['M6',null,'M6','M6'],operator:'erklaere',fb_ok:'Richtig! "Verdoppelt sich" bedeutet: Multiplikation mit konstantem Faktor = exponentiell.',fb_nok:'Exponentiell = konstanter Faktor (z.B. ·2). Linear = konstante Summe (z.B. +50).',mv_nok:'M6',denkfehler:'Lineares Wachstum (konstante Addition) mit exponentiellem (konstanter Faktor) verwechselt.',naechster_schritt:'Linear: f(x) = mx + b (immer gleicher Betrag dazu). Exponentiell: f(x) = a · q^x (immer gleicher Faktor).',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'Exponentiell: konstanter Faktor (·2). Linear: konstante Differenz (+50).'},

  {id:'q7',klp:'K3',l:'L1',mvTarget:'M7',type:'input',xp:14,cat:'Rückwärtsrechnen',ab:2,teil:2,text:'Nach einer Preiserhöhung um 15% kostet ein Artikel jetzt 69 Euro. Wie hoch war der ursprüngliche Preis?',hint:'Der neue Preis ist 115% des alten. Also: alter Preis = 69 / 1,15.',answer:60,tol:0,unit:'Euro',fb_ok:'Richtig! 69 / 1,15 = 60 Euro. Der alte Preis war 60 Euro.',fb_nok:'Der neue Preis entspricht 115% des alten: 69 = 1,15 · G. G = 69/1,15 = 60.',mv_nok:'M7',denkfehler:'15% von 69 abgezogen statt durch 1,15 geteilt (falscher Grundwert).',naechster_schritt:'Rückwärts: Durch den Wachstumsfaktor teilen, nicht den Prozentwert subtrahieren!',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'69 / 1,15 = 60 Euro.'},

  {id:'q8',klp:'K3',l:'L3',mvTarget:'M8',type:'mc',xp:15,cat:'Flächenänderung',ab:3,teil:2,text:'Ein quadratisches Foto (10 cm × 10 cm) wird um 20% vergrößert (jede Seite). Um wie viel Prozent nimmt die Fläche zu? (Cross-topic: Geometrie + Prozent)',opts:['20%','40%','44%','120%'],answer:2,optMV:['M8','M8',null,'M8'],operator:'berechne',fb_ok:'Richtig! Neue Seite: 12 cm. Neue Fläche: 144 cm². Alte Fläche: 100 cm². Zunahme: 44%.',fb_nok:'Neue Seite: 10 · 1,2 = 12 cm. Neue Fläche: 12² = 144 cm². Zunahme: (144-100)/100 = 44%.',mv_nok:'M8',denkfehler:'Annahme, dass 20% Seitenvergrößerung auch 20% Flächenvergrößerung bedeutet.',naechster_schritt:'Fläche wächst quadratisch: Faktor² = 1,2² = 1,44 → 44% Flächenzuwachs.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'Seitenfaktor: 1,2. Flächenfaktor: 1,2² = 1,44. Zunahme: 44%.'},

  {id:'q9',klp:'K1',l:'L4',mvTarget:'M6',type:'tf',xp:11,cat:'Linear vs. Exponentiell',ab:1,teil:1,text:'Eine Bakterienkultur verdoppelt sich alle 20 Minuten. Das Wachstum ist linear. (Cross-topic: Funktionen)',answer:false,operator:'begruende',fb_ok:'Richtig! Verdopplung = konstanter Faktor 2 = exponentielles Wachstum, nicht linear.',fb_nok:'Verdopplung ist multiplikatives Wachstum: f(t) = a · 2^(t/20). Das ist exponentiell!',mv_nok:'M6',denkfehler:'Exponentielles Wachstum als linear eingestuft.',naechster_schritt:'Prüfe: Konstante Differenz → linear. Konstanter Faktor → exponentiell.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'Verdopplung alle 20 min → Faktor 2 → exponentiell: f(t) = a · 2^(t/20).'},

  {id:'q10',klp:'K2',l:'L1',mvTarget:'M1',type:'input',xp:11,cat:'Prozentwert',ab:1,teil:1,text:'In einer Klasse mit 32 Schülern haben 75% die Klassenarbeit bestanden. Wie viele Schüler haben bestanden?',hint:'Berechne 75% von 32.',answer:24,tol:0,unit:'Schüler',fb_ok:'Richtig! 0,75 · 32 = 24 Schüler.',fb_nok:'75% von 32 = 0,75 · 32 = 24.',mv_nok:'M1',denkfehler:'Prozentwert falsch berechnet.',naechster_schritt:'Prozentwert = Grundwert · Prozentsatz/100.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'75% von 32 = 0,75 · 32 = 24 Schüler.'},

  {id:'q11',klp:'K3',l:'L4',mvTarget:'M4',type:'mc',xp:13,cat:'Wachstumsfaktor',ab:2,teil:2,text:'Eine Stadt hat 50.000 Einwohner und wächst jährlich um 3%. Welche Funktion beschreibt die Einwohnerzahl nach t Jahren? (Cross-topic: Funktionen + Wachstum)',opts:['f(t) = 50000 + 1500t','f(t) = 50000 · 1,03^t','f(t) = 50000 · 0,03^t','f(t) = 50000 · 3^t'],answer:1,optMV:['M6',null,'M4','M4'],operator:'bestimme',fb_ok:'Richtig! Exponentielles Wachstum: f(t) = Startwert · Faktor^t = 50000 · 1,03^t.',fb_nok:'3% Wachstum → Faktor 1,03. Exponentiell: f(t) = 50000 · 1,03^t.',mv_nok:'M4',denkfehler:'Wachstumsfaktor 0,03 statt 1,03 verwendet oder lineares Modell gewählt.',naechster_schritt:'Exponentielles Wachstum: f(t) = a · q^t mit q = 1 + p/100.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'f(t) = 50000 · 1,03^t. Prüfung: f(0) = 50000, f(1) = 51500.'},

  {id:'q12',klp:'K2',l:'L5',mvTarget:'M2',type:'mc',xp:12,cat:'Prozentsatz',ab:1,teil:2,text:'Bei einer Umfrage gaben 45 von 200 Befragten an, regelmäßig Sport zu treiben. Wie hoch ist der Prozentsatz? (Cross-topic: Statistik + Prozent)',opts:['22,5%','45%','4,5%','25%'],answer:0,optMV:[null,'M2','M2','M2'],operator:'berechne',fb_ok:'Richtig! p = 45/200 · 100% = 22,5%.',fb_nok:'Prozentsatz = Anteil/Ganzes · 100% = 45/200 · 100% = 22,5%.',mv_nok:'M2',denkfehler:'Grundwert und Prozentwert vertauscht oder Division falsch ausgeführt.',naechster_schritt:'Prozentsatz = (Teil / Ganzes) · 100%.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'p = 45/200 · 100% = 22,5%.'},

  {id:'q13',klp:'K3',l:'L4',mvTarget:'M5',type:'input',xp:15,cat:'Zinseszins',ab:3,teil:2,text:'Ein Kapital von 2000 Euro wird zu 5% Zinsen angelegt. Wie hoch ist der Zinseszins-Ertrag (nicht das Gesamtkapital!) nach 2 Jahren? Runde auf ganze Euro.',hint:'K(2) = 2000 · 1,05². Ertrag = K(2) - 2000.',answer:205,tol:1,unit:'Euro',fb_ok:'Richtig! K(2) = 2000 · 1,05² = 2205 €. Ertrag = 2205 - 2000 = 205 €.',fb_nok:'K(2) = 2000 · 1,1025 = 2205 €. Ertrag = 2205 - 2000 = 205 €.',mv_nok:'M5',denkfehler:'Einfache Zinsen berechnet (200 €) statt Zinseszins (205 €).',naechster_schritt:'Zinseszins: K(n) = K₀ · q^n. Ertrag = K(n) - K₀.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'K(2) = 2000 · 1,05² = 2000 · 1,1025 = 2205 €. Ertrag = 205 €.'},

  {id:'q14',klp:'K1',l:'L1',mvTarget:'M3',type:'tf',xp:11,cat:'Prozentuale Veränderung',ab:2,teil:2,text:'Wenn ein Preis erst um 50% steigt und dann um 50% fällt, ist man wieder beim Ausgangspreis.',answer:false,operator:'begruende',fb_ok:'Richtig! 100 · 1,5 = 150. 150 · 0,5 = 75. Man landet bei 75%, also UNTER dem Ausgangspreis.',fb_nok:'100 → +50% → 150 → -50% → 75. Nicht 100! Die 50% beziehen sich auf verschiedene Grundwerte.',mv_nok:'M3',denkfehler:'Prozentuale Veränderungen einfach addiert statt multiplikativ verknüpft.',naechster_schritt:'Prozentänderungen werden multipliziert: 1,5 · 0,5 = 0,75 (nicht 1,0!).',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'100 · 1,5 · 0,5 = 75. Faktor insgesamt: 0,75 = 75%. Verlust: 25%.'},

  {id:'q15',klp:'K3',l:'L3',mvTarget:'M8',type:'mc',xp:15,cat:'Flächenänderung',ab:3,teil:2,text:'Ein Kreis hat den Radius r. Der Radius wird um 50% vergrößert. Um wie viel Prozent nimmt die Kreisfläche zu? (Cross-topic: Geometrie + Prozent)',opts:['50%','100%','125%','150%'],answer:2,optMV:['M8','M8',null,'M8'],operator:'berechne',fb_ok:'Richtig! Neuer Radius: 1,5r. Neue Fläche: π·(1,5r)² = 2,25πr². Zunahme: 125%.',fb_nok:'Flächenfaktor = Radiusfaktor² = 1,5² = 2,25. Zunahme: 2,25 - 1 = 1,25 = 125%.',mv_nok:'M8',denkfehler:'Seitenänderung direkt als Flächenänderung übernommen.',naechster_schritt:'Fläche ändert sich mit dem Quadrat des Skalierungsfaktors.',video:'https://www.lehrer-schmidt.de/mathematik/',sol:'Faktor: 1,5. Fläche: 1,5² = 2,25-fach. Zunahme: 125%.'}
];

const FOERDER_DATA={
  M1:[
    {diff:'leicht',text:'Berechne 10% von 250.',hint:'10% = 0,1. Also 0,1 · 250 = 25.'},
    {diff:'mittel',text:'Berechne 35% von 480.',hint:'35% = 0,35. Also 0,35 · 480 = 168.'}
  ],
  M2:[
    {diff:'leicht',text:'60 sind 20% von welcher Zahl?',hint:'Grundwert = 60 / 0,2 = 300.'},
    {diff:'mittel',text:'Ein Händler verkauft 150 von 600 Artikeln. Wie viel Prozent sind das?',hint:'150/600 = 0,25 = 25%.'}
  ],
  M3:[
    {diff:'leicht',text:'Ein Preis von 80 Euro steigt um 10%. Wie hoch ist der neue Preis?',hint:'Neuer Preis = 80 · 1,10 = 88 Euro.'},
    {diff:'mittel',text:'Ein Preis fällt von 120 Euro auf 96 Euro. Um wie viel Prozent ist er gefallen?',hint:'Rückgang: 24/120 = 0,2 = 20%.'}
  ],
  M4:[
    {diff:'leicht',text:'Eine Pflanze wächst jährlich um 12%. Wie lautet der Wachstumsfaktor?',hint:'Faktor = 1 + 12/100 = 1,12.'},
    {diff:'mittel',text:'Ein Bestand nimmt jährlich um 5% ab. Wie lautet der Wachstumsfaktor?',hint:'Abnahme: Faktor = 1 - 0,05 = 0,95.'}
  ],
  M5:[
    {diff:'leicht',text:'1000 Euro, 3% Zinsen, 2 Jahre. Berechne das Endkapital mit Zinseszins.',hint:'K(2) = 1000 · 1,03² = 1000 · 1,0609 = 1060,90 €.'},
    {diff:'mittel',text:'Wie viel muss man bei 4% anlegen, um nach 3 Jahren 1000 Euro zu haben?',hint:'K₀ = 1000 / 1,04³ = 1000 / 1,124864 ≈ 889,00 €.'}
  ],
  M6:[
    {diff:'leicht',text:'Tabelle: t=0→100, t=1→200, t=2→400. Lineares oder exponentielles Wachstum?',hint:'Faktor ist konstant: 200/100=2, 400/200=2. Exponentiell!'},
    {diff:'mittel',text:'Zeichne die Graphen von f(t)=100+50t und g(t)=100·1,5^t für t=0,1,2,3,4.',hint:'Linear: 100,150,200,250,300. Exponentiell: 100,150,225,337,506.'}
  ],
  M7:[
    {diff:'leicht',text:'Nach 25% Rabatt kostet ein Artikel 60 Euro. Was war der Originalpreis?',hint:'60 Euro = 75% des Originals. G = 60/0,75 = 80 Euro.'},
    {diff:'mittel',text:'Nach einer Erhöhung um 8% kostet ein Produkt 162 Euro. Berechne den alten Preis.',hint:'162 / 1,08 = 150 Euro.'}
  ],
  M8:[
    {diff:'leicht',text:'Ein Quadrat mit Seite 5 cm wird auf Seitenlänge 10 cm vergrößert. Um wie viel % wächst die Fläche?',hint:'Alte Fläche: 25. Neue Fläche: 100. Zunahme: 300%.'},
    {diff:'mittel',text:'Ein Rechteck wird in Länge und Breite um je 30% vergrößert. Um wie viel Prozent nimmt die Fläche zu?',hint:'Flächenfaktor: 1,3 · 1,3 = 1,69. Zunahme: 69%.'}
  ]
};

// WORKED EXAMPLES WITH SCAFFOLDING (Feature B)
const WORKED_EXAMPLES={
  M1:{
    mv:'M1',
    title:'Prozentwert berechnen: 25% von 360',
    steps:[
      '✅ Schritt 1: Wandle den Prozentsatz in eine Dezimalzahl um: 25% = 25/100 = 0,25',
      '✅ Schritt 2: Multipliziere: 0,25 · 360 = 90',
      '✅ Schritt 3: Der Prozentwert beträgt 90'
    ],
    finalAnswer:'25% von 360 = 90',
    scaffolded:[
      {text:'25% als Dezimalzahl: 25/100 = ?',gap:1,answer:'0,25'},
      {text:'0,25 · 360 = ?',gap:2,answer:'90'},
      {text:'15% von 200 = ?',gap:3,answer:'30'},
      {text:'50% von 84 = ?',gap:4,answer:'42'}
    ]
  },
  M4:{
    mv:'M4',
    title:'Wachstumsfaktor bestimmen: 8% Zunahme',
    steps:[
      '✅ Schritt 1: Zunahme um 8% bedeutet: neuer Wert = 100% + 8% = 108% des alten',
      '✅ Schritt 2: 108% als Dezimalzahl: 108/100 = 1,08',
      '✅ Schritt 3: Der Wachstumsfaktor ist q = 1,08',
      '✅ Schritt 4: Neuer Wert = Alter Wert · 1,08'
    ],
    finalAnswer:'Wachstumsfaktor bei 8% Zunahme: q = 1,08',
    scaffolded:[
      {text:'Zunahme um 8%: 100% + 8% = ?%',gap:1,answer:'108'},
      {text:'108% als Dezimalzahl: ?',gap:2,answer:'1,08'},
      {text:'Abnahme um 5%: Faktor = 1 - 0,05 = ?',gap:3,answer:'0,95'},
      {text:'200 Euro, +8%: 200 · 1,08 = ?',gap:4,answer:'216'}
    ]
  },
  M5:{
    mv:'M5',
    title:'Zinseszins: 500 Euro, 4%, 3 Jahre',
    steps:[
      '✅ Schritt 1: Identifiziere: K₀ = 500 €, q = 1,04, n = 3',
      '✅ Schritt 2: Formel: K(n) = K₀ · q^n',
      '✅ Schritt 3: Einsetzen: K(3) = 500 · 1,04³',
      '✅ Schritt 4: Berechne 1,04³ = 1,04 · 1,04 · 1,04 = 1,124864',
      '✅ Schritt 5: K(3) = 500 · 1,124864 = 562,43 €'
    ],
    finalAnswer:'Nach 3 Jahren: 562,43 € (Zinseszins)',
    scaffolded:[
      {text:'Wachstumsfaktor bei 4% Zinsen: q = ?',gap:1,answer:'1,04'},
      {text:'1,04² = ?',gap:2,answer:'1,0816'},
      {text:'1,04³ = 1,04² · 1,04 ≈ ?',gap:3,answer:'1,1249'},
      {text:'500 · 1,1249 ≈ ?',gap:4,answer:'562,43'}
    ]
  }
};
