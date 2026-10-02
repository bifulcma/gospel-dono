// Il percorso degli Esercizi spirituali, nell'ordine del libro.
// Testi tradotti dall'Autografo spagnolo di sant'Ignazio (pubblico dominio); i numeri
// tra parentesi quadre sono la numerazione marginale degli Esercizi.
// Le parole tra virgolette basse nei punti sono quelle che Ignazio stesso trae dal
// Vangelo [261], qui rese dalla sua citazione spagnola, non da una traduzione biblica.

export const ORAZIONE_PREPARATORIA =
  'Chiedo grazia a Dio nostro Signore perché tutte le mie intenzioni, azioni e operazioni siano ordinate puramente al servizio e alla lode della sua divina maestà.';

export const ADDIZIONE_INGRESSO =
  'Un passo o due prima del luogo della preghiera, resto in piedi per il tempo di un Padre nostro, con la mente rivolta in alto, considerando come Dio nostro Signore mi guarda; e faccio un gesto di riverenza.';

export const ESAME_PREGHIERA =
  'Finito l’esercizio, per un quarto d’ora, seduto o camminando, guardo come mi è andata nella contemplazione o meditazione. Se male, cerco la causa da cui viene e, trovatala, me ne pento per correggermi in seguito; se bene, ringrazio Dio nostro Signore.';

export const FASI = [
  {
    k: 'fondamento',
    nome: 'Principio e Fondamento',
    breve: 'Fondamento',
    grazia:
      'Chiedo la libertà interiore: di non volere, da parte mia, più la salute che la malattia, la ricchezza che la povertà, l’onore che il disonore, la vita lunga che la breve, ma solo ciò che più mi conduce al fine per cui sono creato.',
    graziaNota: 'Qui Ignazio non formula una domanda: la si ricava dal testo [23].',
    luogo: 'Vedermi davanti a Dio nostro Signore, che mi guarda [75].',
    colloquio:
      'Parlo a Dio come un amico parla a un amico [54]: di ciò che mi trattiene, di ciò che desidero. Concludo con un Padre nostro.',
    regole: 'prima',
  },
  {
    k: 'prima',
    nome: 'Prima settimana',
    breve: 'I settimana',
    grazia:
      'Chiedo vergogna e confusione di me stesso, vedendo quanti si sono perduti per un solo peccato mortale, e quante volte io meritavo di esserlo per i miei tanti peccati [48].',
    luogo:
      'Vedere con l’immaginazione la mia anima come imprigionata in questo corpo corruttibile, e tutto me stesso, anima e corpo, come in esilio in questa valle [47].',
    colloquio:
      'Immaginando Cristo nostro Signore davanti a me, appeso alla croce, gli parlo: come da Creatore si è fatto uomo, e dalla vita eterna è venuto alla morte temporale, e così a morire per i miei peccati. Poi guardo me stesso: che cosa ho fatto per Cristo, che cosa faccio per Cristo, che cosa devo fare per Cristo. E vedendolo così, appeso alla croce, discorro su ciò che mi si presenta [53]. Il colloquio si fa come un amico parla a un altro: ora chiedendo una grazia, ora accusandomi di un male fatto, ora confidando le mie cose e chiedendo consiglio [54]. Un Padre nostro.',
    regole: 'prima',
  },
  {
    k: 'seconda',
    nome: 'Seconda settimana',
    breve: 'II settimana',
    grazia:
      'Chiedo conoscenza interna del Signore, che per me si è fatto uomo, perché più lo ami e lo segua [104].',
    luogo:
      'Vedere con la vista dell’immaginazione il luogo dove accade il mistero: la strada, la casa, il monte, quanto è grande o piccolo, come è disposto [47][112].',
    colloquio:
      'Penso a ciò che devo dire alle tre Persone divine, o al Verbo eterno incarnato, o alla Madre e Signora nostra, chiedendo secondo ciò che sento in me, per seguire e imitare di più il Signore nostro, così nuovamente incarnato [109]. Un Padre nostro.',
    regole: 'seconda',
  },
  {
    k: 'terza',
    nome: 'Terza settimana',
    breve: 'III settimana',
    grazia:
      'Chiedo dolore con Cristo addolorato, strazio con Cristo straziato, lacrime e pena interiore per tanta pena che Cristo ha patito per me [203].',
    luogo:
      'Considerare il luogo e la strada del mistero: se larga o stretta, se piana; il luogo, se grande o piccolo, di un modo o di un altro [192][202].',
    colloquio:
      'Concludo con un colloquio a Cristo nostro Signore, chiedendo secondo la materia: secondo che mi trovo tentato o consolato, secondo la virtù che desidero, secondo che voglio dolermi della cosa che contemplo. Se la devozione mi muove, faccio tre colloqui: alla Madre, al Figlio, al Padre [199]. Un Padre nostro.',
    regole: 'seconda',
    puntiAggiunti: [
      'Considerare ciò che Cristo nostro Signore patisce nella sua umanità, o vuole patire, secondo il passo che contemplo; e qui cominciare con molta forza e sforzarmi di dolermi, rattristarmi e piangere [195].',
      'Considerare come la Divinità si nasconde: come potrebbe distruggere i suoi nemici e non lo fa, e come lascia patire la sacratissima umanità così crudelmente [196].',
      'Considerare come tutto questo lo patisce per i miei peccati, e che cosa devo io fare e patire per lui [197].',
    ],
  },
  {
    k: 'quarta',
    nome: 'Quarta settimana',
    breve: 'IV settimana',
    grazia:
      'Chiedo grazia per rallegrarmi e godere intensamente di tanta gloria e gioia di Cristo nostro Signore [221].',
    luogo: 'Vedere con l’immaginazione il luogo del mistero: il sepolcro, la casa, la strada, il lago, il monte [220].',
    colloquio:
      'Concludo con un colloquio, o con più colloqui, secondo la materia [225]: a Cristo risorto, come si parla a un amico che consola. Un Padre nostro.',
    regole: 'seconda',
    puntiAggiunti: [
      'Considerare come la Divinità, che sembrava nascondersi nella passione, appare e si mostra ora così miracolosamente nella santissima risurrezione, attraverso i suoi effetti veri e santissimi [223].',
      'Guardare l’ufficio di consolare che Cristo nostro Signore porta, paragonandolo a come gli amici sogliono consolarsi tra loro [224].',
    ],
  },
];

// q: riferimento nel formato di laparola.net (libro+capitolo,versetti)
const T = [
  // ── Principio e Fondamento
  {
    id: 'fondamento',
    fase: 'fondamento',
    titolo: 'Principio e Fondamento',
    num: '[23]',
    storia:
      'Prima di ogni esercizio, Ignazio mette un fondamento: perché sono stato creato, e come devo usare tutto il resto.',
    punti: [
      'L’uomo è creato per lodare, riverire e servire Dio nostro Signore, e mediante questo salvare la sua anima.',
      'Le altre cose sulla faccia della terra sono create per l’uomo, perché lo aiutino a conseguire il fine per cui è creato. Ne segue che l’uomo tanto deve usarne quanto lo aiutano per il suo fine, e tanto deve liberarsene quanto glielo impediscono.',
      'Per questo è necessario renderci indifferenti verso tutte le cose create, in tutto ciò che è lasciato alla libertà del nostro libero arbitrio: desiderando e scegliendo soltanto ciò che più ci conduce al fine per cui siamo creati.',
    ],
  },

  // ── Prima settimana
  {
    id: 'tre-peccati',
    fase: 'prima',
    titolo: 'Il primo, il secondo e il terzo peccato',
    num: '[45]–[54]',
    storia:
      'Meditazione con le tre potenze, memoria, intelletto e volontà, sul peccato degli angeli, su quello di Adamo ed Eva, e sul peccato di uno solo che per esso si è perduto.',
    punti: [
      'Richiamare alla memoria il peccato degli angeli: creati in grazia, non volendo aiutarsi con la loro libertà a riverire e obbedire al loro Creatore e Signore, venendo in superbia, furono mutati dalla grazia alla malizia. Poi discorrere con l’intelletto, e muovere gli affetti con la volontà, paragonando a un solo peccato loro i tanti peccati miei [50].',
      'Fare altrettanto sul peccato di Adamo ed Eva: come, mangiando dell’albero proibito, furono cacciati dal paradiso e vissero senza la giustizia originale, e quanta corruzione venne nel genere umano [51].',
      'Fare altrettanto sul peccato particolare di uno solo che per un peccato mortale si è perduto, e di tanti altri senza numero per peccati minori dei miei: la gravità e la malizia del peccato contro il Creatore e Signore, contro la bontà infinita [52].',
    ],
  },
  {
    id: 'miei-peccati',
    fase: 'prima',
    titolo: 'I miei peccati',
    num: '[55]–[61]',
    grazia: 'Chiedo dolore crescente e intenso, e lacrime per i miei peccati [55].',
    storia: 'Meditazione sui peccati della mia vita, in cinque punti, che termina in un colloquio di misericordia.',
    punti: [
      'Il processo dei peccati: richiamare alla memoria tutti i peccati della vita, guardando anno per anno o tempo per tempo. Aiutano tre cose: il luogo e la casa dove ho abitato; le relazioni che ho avuto con gli altri; l’ufficio in cui sono vissuto [56].',
      'Ponderare i peccati, guardando la bruttezza e la malizia che ciascun peccato ha in sé [57].',
      'Guardare chi sono io, sminuendomi con esempi: quanto sono io in confronto a tutti gli uomini; che cosa sono gli uomini in confronto agli angeli e ai santi; che cosa è tutto il creato in confronto a Dio: e io solo, che cosa posso essere? [58]',
      'Considerare chi è Dio, contro cui ho peccato, confrontando i suoi attributi con i loro contrari in me: la sua sapienza con la mia ignoranza, la sua onnipotenza con la mia debolezza, la sua giustizia con la mia iniquità, la sua bontà con la mia malizia [59].',
      'Esclamazione di meraviglia con affetto crescente, scorrendo tutte le creature: come mi hanno lasciato in vita e mi ci hanno conservato; gli angeli, i santi che hanno pregato per me; i cieli, il sole, la luna, le stelle, i frutti, gli uccelli, i pesci, gli animali; e la terra, come non si è aperta per inghiottirmi [60].',
    ],
    colloquio:
      'Termino con un colloquio di misericordia, ragionando e ringraziando Dio nostro Signore perché mi ha dato vita fino a ora, proponendo di correggermi con la sua grazia per l’avvenire [61]. Un Padre nostro.',
  },
  {
    id: 'ripetizione',
    fase: 'prima',
    titolo: 'Ripetizione, con tre colloqui',
    num: '[62]–[64]',
    storia:
      'Non si aggiunge materia nuova: si torna sui due esercizi precedenti, fermandosi dove si è sentita maggiore consolazione o desolazione, o maggiore sentimento spirituale.',
    punti: [
      'Ripetere il primo esercizio, i tre peccati, notando i punti in cui ho sentito di più [62].',
      'Ripetere il secondo esercizio, i miei peccati, allo stesso modo [62].',
      'Riassumere: che l’intelletto, senza divagare, scorra assiduamente sul ricordo delle cose contemplate negli esercizi passati [64].',
    ],
    colloquio:
      'Tre colloqui [63]. Il primo a nostra Signora, perché mi ottenga dal Figlio grazia per tre cose: che senta conoscenza interna dei miei peccati e ne provi orrore; che senta il disordine delle mie azioni, perché provandone orrore mi corregga e mi ordini; conoscenza del mondo, perché provandone orrore allontani da me le cose mondane e vane. Un’Ave Maria. Il secondo, lo stesso al Figlio, perché me lo ottenga dal Padre: l’Anima Christi. Il terzo, lo stesso al Padre, perché egli stesso, Signore eterno, me lo conceda: un Padre nostro.',
  },
  {
    id: 'inferno',
    fase: 'prima',
    titolo: 'L’inferno',
    num: '[65]–[71]',
    grazia:
      'Chiedo sentimento interno della pena dei dannati, perché se per le mie colpe mi dimenticassi dell’amore del Signore eterno, almeno il timore delle pene mi aiuti a non cadere nel peccato [65].',
    luogo: 'Vedere con l’immaginazione la lunghezza, la larghezza e la profondità dell’inferno [65].',
    storia: 'Meditazione con i cinque sensi dell’immaginazione.',
    punti: [
      'Vedere con l’immaginazione i grandi fuochi, e le anime come in corpi di fuoco [66].',
      'Udire pianti, urla, grida, bestemmie contro Cristo nostro Signore e contro tutti i suoi santi [67].',
      'Odorare fumo, zolfo, sentina e cose putride [68].',
      'Gustare cose amare, come lacrime, tristezza e il verme della coscienza [69].',
      'Toccare: come i fuochi toccano e bruciano le anime [70].',
    ],
    colloquio:
      'Colloquio a Cristo nostro Signore: richiamo alla memoria le anime perdute, alcune perché non credettero alla sua venuta, altre che credendo non operarono secondo i suoi comandamenti; e lo ringrazio perché non mi ha lasciato cadere in nessuna di queste, ponendo fine alla mia vita; e come fino a ora ha sempre avuto di me tanta pietà e misericordia [71]. Un Padre nostro.',
  },

  // ── Seconda settimana
  {
    id: 'regno',
    fase: 'seconda',
    titolo: 'La chiamata del Re',
    num: '[91]–[98]',
    grazia:
      'Chiedo grazia al Signore nostro di non essere sordo alla sua chiamata, ma pronto e diligente nel compiere la sua santissima volontà [91].',
    luogo:
      'Vedere con l’immaginazione sinagoghe, villaggi e castelli dove Cristo nostro Signore predicava [91].',
    storia:
      'La chiamata di un re terreno aiuta a contemplare la vita del Re eterno. È la porta della seconda settimana.',
    punti: [
      'Mettermi davanti un re umano, scelto dalla mano di Dio, che parla ai suoi: chi vorrà venire con me dovrà accontentarsi di mangiare come me, di vestire come me, di faticare con me di giorno e vegliare di notte, perché poi abbia parte con me nella vittoria come l’ha avuta nelle fatiche. E considerare che cosa devono rispondere i buoni sudditi a un re così generoso e umano [92]–[94].',
      'Applicare l’esempio a Cristo nostro Signore, Re eterno, che davanti a tutto il mondo chiama ciascuno in particolare: «La mia volontà è conquistare tutto il mondo e tutti i nemici, e così entrare nella gloria del Padre mio; chi vorrà venire con me deve faticare con me, perché seguendomi nella pena mi segua anche nella gloria» [95].',
      'Considerare che tutti quelli che hanno giudizio e ragione offriranno tutta la loro persona alla fatica; e quelli che vorranno distinguersi di più nel servizio del loro Re eterno, agendo contro la propria sensualità e il proprio amore carnale e mondano, faranno offerte di maggior valore [96]–[97].',
    ],
    colloquio:
      'L’offerta [98]: «Eterno Signore di tutte le cose, io faccio la mia offerta, con il vostro favore e aiuto, davanti alla vostra infinita bontà, e davanti alla vostra Madre gloriosa e a tutti i santi e sante della corte celeste: che io voglio e desidero, ed è mia determinazione deliberata, purché sia vostro maggior servizio e lode, imitarvi nel sopportare ogni ingiuria e ogni disprezzo e ogni povertà, sia attuale sia spirituale, se la vostra santissima maestà vorrà scegliermi e accogliermi in tale vita e stato».',
  },
  {
    id: 'incarnazione',
    fase: 'seconda',
    titolo: 'L’Incarnazione',
    num: '[101]–[109] · [262]',
    brano: { rif: 'Lc 1,26-38', q: 'Lc1,26-38' },
    storia:
      'Le tre Persone divine guardano tutta la superficie della terra piena di uomini, e vedendo che tutti si perdono, decidono nella loro eternità che la seconda Persona si faccia uomo per salvare il genere umano; e venuta la pienezza dei tempi, mandano l’angelo Gabriele a nostra Signora [102].',
    luogo:
      'Vedere la grande estensione del mondo, con tante e così diverse genti; poi, in particolare, la casa e le stanze di nostra Signora, nella città di Nazaret, in Galilea [103].',
    punti: [
      'Vedere le persone: sulla faccia della terra, in tanta diversità, alcuni in pace e altri in guerra, alcuni che piangono e altri che ridono, alcuni che nascono e altri che muoiono; le tre Persone divine che guardano tutta la terra; e nostra Signora con l’angelo che la saluta. E riflettere per trarne profitto [106].',
      'Udire che cosa dicono: le persone sulla terra tra loro; le Persone divine: «Facciamo la redenzione del genere umano»; l’angelo e nostra Signora: «Ecco la serva del Signore; si compia in me secondo la tua parola». E riflettere [107][262].',
      'Guardare che cosa fanno: le persone sulla terra; le Persone divine, operando la santissima incarnazione; l’angelo, facendo il suo ufficio di messaggero, e nostra Signora, umiliandosi e rendendo grazie alla divina maestà. E riflettere per trarne profitto [108].',
    ],
  },
  {
    id: 'visitazione',
    fase: 'seconda',
    titolo: 'La Visitazione',
    num: '[263]',
    brano: { rif: 'Lc 1,39-56', q: 'Lc1,39-56' },
    punti: [
      'Quando nostra Signora visita Elisabetta, Giovanni Battista, nel grembo di sua madre, sente la visita: «Come Elisabetta udì il saluto di nostra Signora, il bambino sussultò nel suo grembo; e piena di Spirito Santo esclamò a gran voce: benedetta tu fra le donne, e benedetto il frutto del tuo grembo».',
      'Nostra Signora canta il cantico: «L’anima mia magnifica il Signore».',
      '«Maria rimase con Elisabetta circa tre mesi, e poi tornò a casa sua».',
    ],
  },
  {
    id: 'nativita',
    fase: 'seconda',
    titolo: 'La Natività',
    num: '[110]–[117] · [264]',
    brano: { rif: 'Lc 2,1-14', q: 'Lc2,1-14' },
    storia:
      'Da Nazaret partono nostra Signora, incinta di quasi nove mesi, seduta, come si può piamente meditare, su un’asina, e Giuseppe con una serva, portando un bue, per andare a Betlemme a pagare il tributo che Cesare impose su tutte quelle terre [111].',
    luogo:
      'Vedere la strada da Nazaret a Betlemme, la sua lunghezza e larghezza, se piana o per valli e salite; e il luogo o grotta della nascita, quanto grande, quanto piccolo, quanto basso, quanto alto, e come era preparato [112].',
    punti: [
      'Vedere le persone: nostra Signora, Giuseppe, la serva e il bambino Gesù dopo la nascita, facendomi io un poverello e un piccolo servo indegno, guardandoli, contemplandoli e servendoli nelle loro necessità, come se fossi presente, con tutta la riverenza possibile. Poi riflettere in me stesso per trarne profitto [114].',
      'Guardare, notare e contemplare che cosa dicono; e riflettendo in me stesso, trarne profitto [115].',
      'Guardare e considerare che cosa fanno: il camminare e il faticare, perché il Signore nasca in somma povertà, e alla fine di tante fatiche, di fame, di sete, di caldo e di freddo, di ingiurie e affronti, muoia in croce; e tutto questo per me. Poi riflettere e trarne profitto spirituale [116].',
    ],
  },
  {
    id: 'pastori',
    fase: 'seconda',
    titolo: 'I pastori',
    num: '[265]',
    brano: { rif: 'Lc 2,8-20', q: 'Lc2,8-20' },
    punti: [
      'La nascita di Cristo nostro Signore è manifestata ai pastori dall’angelo: «Vi annuncio una grande gioia, perché oggi è nato il Salvatore del mondo».',
      'I pastori vanno a Betlemme: «vennero in fretta e trovarono Maria, Giuseppe e il Bambino posto nella mangiatoia».',
      '«I pastori tornarono glorificando e lodando il Signore».',
    ],
  },
  {
    id: 'circoncisione',
    fase: 'seconda',
    titolo: 'La Circoncisione',
    num: '[266]',
    brano: { rif: 'Lc 2,21', q: 'Lc2,21' },
    punti: [
      'Circoncisero il bambino Gesù.',
      '«Il suo nome è chiamato Gesù, come fu chiamato dall’angelo prima che fosse concepito nel grembo».',
      'Restituiscono il Bambino a sua Madre, che aveva compassione del sangue che usciva dal Figlio.',
    ],
  },
  {
    id: 'magi',
    fase: 'seconda',
    titolo: 'I Magi',
    num: '[267]',
    brano: { rif: 'Mt 2,1-12', q: 'Mt2,1-12' },
    punti: [
      'I tre re magi, guidati dalla stella, vengono ad adorare Gesù, dicendo: «Abbiamo visto la sua stella in Oriente e siamo venuti ad adorarlo».',
      'Lo adorano e gli offrono doni: «Prostrandosi a terra lo adorarono e gli presentarono doni: oro, incenso e mirra».',
      '«Ricevettero risposta in sogno di non tornare da Erode, e per un’altra via tornarono al loro paese».',
    ],
  },
  {
    id: 'presentazione',
    fase: 'seconda',
    titolo: 'La Presentazione al tempio',
    num: '[268]',
    brano: { rif: 'Lc 2,22-39', q: 'Lc2,22-39' },
    punti: [
      'Portano il bambino Gesù al tempio, perché sia presentato al Signore come primogenito, e offrono per lui «una coppia di tortore o due giovani colombi».',
      'Simeone, venendo al tempio, «lo prese tra le braccia» dicendo: «Ora, Signore, lascia il tuo servo in pace».',
      'Anna, «sopraggiunta, lodava il Signore e parlava di lui a tutti quelli che aspettavano la redenzione d’Israele».',
    ],
  },
  {
    id: 'fuga',
    fase: 'seconda',
    titolo: 'La fuga in Egitto',
    num: '[269]',
    brano: { rif: 'Mt 2,13-18', q: 'Mt2,13-18' },
    punti: [
      'Erode voleva uccidere il bambino Gesù, e uccise gli innocenti; prima della loro morte l’angelo avvertì Giuseppe di fuggire in Egitto: «Alzati, prendi il Bambino e sua Madre e fuggi in Egitto».',
      'Partì per l’Egitto: «Alzatosi di notte, partì per l’Egitto».',
      '«Rimase là fino alla morte di Erode».',
    ],
  },
  {
    id: 'ritorno',
    fase: 'seconda',
    titolo: 'Il ritorno dall’Egitto',
    num: '[270]',
    brano: { rif: 'Mt 2,19-23', q: 'Mt2,19-23' },
    punti: [
      'L’angelo avverte Giuseppe di tornare in Israele: «Alzati, prendi il Bambino e sua Madre e va’ nella terra d’Israele».',
      '«Alzatosi, venne nella terra d’Israele».',
      'Poiché in Giudea regnava Archelao, figlio di Erode, si ritirò a Nazaret.',
    ],
  },
  {
    id: 'nazaret',
    fase: 'seconda',
    titolo: 'La vita nascosta a Nazaret',
    num: '[271] · [134]',
    brano: { rif: 'Lc 2,51-52', q: 'Lc2,51-52' },
    storia:
      'Ignazio vede qui l’esempio del primo stato di vita, l’osservanza dei comandamenti: Cristo obbediente ai suoi genitori [135].',
    punti: [
      'Era obbediente ai suoi genitori.',
      '«Cresceva in sapienza, età e grazia».',
      'Sembra che esercitasse il mestiere di falegname, come sembra indicare Marco al capitolo sesto: «Non è costui il falegname?».',
    ],
  },
  {
    id: 'tempio-dodici',
    fase: 'seconda',
    titolo: 'Gesù dodicenne al tempio',
    num: '[272] · [135]',
    brano: { rif: 'Lc 2,41-50', q: 'Lc2,41-50' },
    storia:
      'Qui Ignazio vede l’esempio del secondo stato, la perfezione evangelica: Cristo resta nel tempio, lasciando il padre adottivo e la madre naturale, per dedicarsi al puro servizio del Padre eterno. Da qui si comincia a cercare in quale vita o stato la divina maestà vuole servirsi di noi [135].',
    punti: [
      'Cristo nostro Signore, a dodici anni, sale da Nazaret a Gerusalemme.',
      'Cristo nostro Signore rimase a Gerusalemme, e i suoi parenti non lo seppero.',
      'Passati tre giorni lo trovarono che discuteva nel tempio, seduto in mezzo ai dottori; e chiedendogli i genitori dove fosse stato, rispose: «Non sapete che devo occuparmi delle cose del Padre mio?».',
    ],
  },
  {
    id: 'due-bandiere',
    fase: 'seconda',
    titolo: 'Le due bandiere',
    num: '[136]–[148]',
    grazia:
      'Chiedo conoscenza degli inganni del cattivo capo e aiuto per guardarmene; e conoscenza della vita vera che mostra il sommo e vero capitano, e grazia per imitarlo [139].',
    luogo:
      'Vedere un grande campo in tutta la regione di Gerusalemme, dove il sommo capitano dei buoni è Cristo nostro Signore; e un altro campo nella regione di Babilonia, dove il capo dei nemici è Lucifero [138].',
    storia: 'Cristo chiama e vuole tutti sotto la sua bandiera; e Lucifero, al contrario, sotto la sua [137].',
    punti: [
      'Immaginare il capo dei nemici seduto nel grande campo di Babilonia, come su una grande cattedra di fuoco e di fumo, in figura orribile e spaventosa; come chiama innumerevoli demoni e li sparge per tutto il mondo, senza tralasciare province, luoghi, stati né persona alcuna [140]–[141].',
      'Considerare il discorso che fa loro: tendere reti e catene; tentare prima con la cupidigia delle ricchezze, perché più facilmente vengano al vano onore del mondo, e poi alla grande superbia. Il primo gradino le ricchezze, il secondo l’onore, il terzo la superbia; e da questi tre gradini induce a tutti gli altri vizi [142].',
      'Al contrario, Cristo nostro Signore si pone in un grande campo della regione di Gerusalemme, in luogo umile, bello e grazioso; sceglie tante persone, apostoli e discepoli, e le manda per tutto il mondo; e raccomanda loro di aiutare tutti portandoli primo alla somma povertà spirituale, e, se la divina maestà vorrà, anche alla povertà attuale; secondo, al desiderio di obbrobri e disprezzi, perché da queste due cose segue l’umiltà. Tre gradini: povertà contro ricchezza, obbrobrio contro onore mondano, umiltà contro superbia; e da questi tre gradini inducano a tutte le altre virtù [144]–[146].',
    ],
    colloquio:
      'Tre colloqui [147]. A nostra Signora, perché mi ottenga dal Figlio la grazia di essere ricevuto sotto la sua bandiera: prima nella somma povertà spirituale e, se la divina maestà vorrà scegliermi, anche nella povertà attuale; poi nel sopportare obbrobri e ingiurie per imitarlo di più, purché possa sopportarli senza peccato di nessuno e senza dispiacere della sua divina maestà. Un’Ave Maria. Lo stesso al Figlio, perché me lo ottenga dal Padre: l’Anima Christi. Lo stesso al Padre, perché me lo conceda: un Padre nostro.',
  },
  {
    id: 'tre-coppie',
    fase: 'seconda',
    titolo: 'Le tre coppie di uomini',
    num: '[149]–[157]',
    grazia:
      'Chiedo grazia per scegliere ciò che più sia a gloria della sua divina maestà e salvezza della mia anima [152].',
    luogo:
      'Vedere me stesso, come sto davanti a Dio nostro Signore e a tutti i suoi santi, per desiderare e conoscere ciò che sia più gradito alla sua divina bontà [151].',
    storia:
      'Tre coppie di uomini hanno acquistato ciascuna diecimila ducati, non puramente o debitamente per amore di Dio; tutti vogliono salvarsi e trovare in pace Dio nostro Signore, togliendo da sé il peso e l’impedimento che hanno nell’affetto alla cosa acquistata [150].',
    punti: [
      'La prima coppia vorrebbe togliere l’affetto alla cosa acquistata, per trovare in pace Dio nostro Signore, ma non pone i mezzi fino all’ora della morte [153].',
      'La seconda vuole togliere l’affetto, ma in modo da restare con la cosa acquistata: così che Dio venga dove vuole lei, e non si decide a lasciarla per andare a Dio, anche se fosse lo stato migliore per lei [154].',
      'La terza vuole togliere l’affetto, ma in modo da non avere affezione né a tenere la cosa né a non tenerla: vuole soltanto volerla o non volerla secondo che Dio nostro Signore le metterà nella volontà. E intanto fa conto di lasciare tutto nell’affetto, sforzandosi di non volere né quella né altra cosa, se non la muove soltanto il servizio di Dio nostro Signore [155].',
    ],
    colloquio:
      'Gli stessi tre colloqui delle due bandiere: a nostra Signora, al Figlio, al Padre [156]. E se sento affetto o ripugnanza verso la povertà attuale, se non sono indifferente, aiuta molto chiedere nei colloqui, anche contro la carne, che il Signore mi scelga in povertà attuale; purché sia servizio e lode della sua divina bontà [157].',
  },
  {
    id: 'tre-umilta',
    fase: 'seconda',
    titolo: 'I tre modi di umiltà',
    num: '[164]–[168]',
    grazia:
      'Chiedo che il Signore nostro voglia scegliermi in questa terza umiltà, maggiore e migliore, per imitarlo e servirlo di più, se è uguale o maggiore servizio e lode della sua divina maestà [168].',
    storia:
      'Prima di entrare nelle elezioni, per affezionarsi alla vera dottrina di Cristo, aiuta molto considerare questi tre modi di umiltà, tornandoci a momenti per tutta la giornata [164].',
    punti: [
      'Il primo modo, necessario per la salvezza: abbassarmi e umiliarmi quanto mi è possibile, per obbedire in tutto alla legge di Dio nostro Signore, così che nemmeno se mi facessero signore di tutte le cose create, né per la mia stessa vita, prenderei in considerazione di trasgredire un comandamento che mi obblighi sotto peccato mortale [165].',
      'Il secondo, più perfetto: se mi trovo in tale punto da non volere né affezionarmi più alla ricchezza che alla povertà, all’onore che al disonore, alla vita lunga che alla breve, essendo uguale il servizio di Dio e la salvezza della mia anima; e che per tutto il creato, né se mi togliessero la vita, prenderei in considerazione di fare un peccato veniale [166].',
      'Il terzo, perfettissimo: quando, includendo il primo e il secondo, ed essendo uguale la lode e la gloria della divina maestà, per imitare Cristo nostro Signore e somigliargli più attualmente, voglio e scelgo più la povertà con Cristo povero che la ricchezza, gli obbrobri con Cristo che ne fu colmo che gli onori, e desidero essere stimato stolto e pazzo per Cristo, che per primo fu tenuto per tale, più che saggio e prudente in questo mondo [167].',
    ],
    colloquio:
      'I tre colloqui delle coppie di uomini, a nostra Signora, al Figlio, al Padre, chiedendo di essere scelto in questa terza umiltà [168].',
  },
  {
    id: 'battesimo',
    fase: 'seconda',
    titolo: 'Da Nazaret al Giordano: il Battesimo',
    num: '[158] · [273]',
    brano: { rif: 'Mt 3,13-17', q: 'Mt3,13-17' },
    storia: 'Da questa contemplazione Ignazio fa cominciare la materia delle elezioni [163].',
    punti: [
      'Cristo nostro Signore, dopo essersi congedato dalla sua benedetta Madre, venne da Nazaret al fiume Giordano, dove era san Giovanni Battista.',
      'San Giovanni battezza Cristo nostro Signore; e volendo scusarsi, ritenendosi indegno di battezzarlo, Cristo gli dice: «Fa’ così per ora, perché conviene che adempiamo ogni giustizia».',
      '«Venne lo Spirito Santo e la voce del Padre dal cielo affermando: questo è il mio Figlio amato, del quale sono molto compiaciuto».',
    ],
  },
  {
    id: 'tentazioni',
    fase: 'seconda',
    titolo: 'Le tentazioni nel deserto',
    num: '[161] · [274]',
    brano: { rif: 'Mt 4,1-11', q: 'Mt4,1-11' },
    punti: [
      'Dopo il battesimo andò nel deserto, dove digiunò quaranta giorni e quaranta notti.',
      'Fu tentato dal nemico tre volte: «Accostatosi il tentatore gli disse: se sei Figlio di Dio, di’ che queste pietre diventino pane; gettati giù di qui; tutto questo che vedi ti darò, se prostrato a terra mi adorerai».',
      '«Vennero gli angeli e lo servivano».',
    ],
  },
  {
    id: 'chiamata',
    fase: 'seconda',
    titolo: 'La chiamata degli apostoli',
    num: '[161] · [275]',
    brano: { rif: 'Gv 1,35-51', q: 'Gv1,35-51' },
    punti: [
      'Pietro e Andrea sembrano chiamati tre volte: prima a una certa conoscenza (Giovanni, capitolo primo); poi a seguire in qualche modo Cristo, con il proposito di tornare a possedere ciò che avevano lasciato (Luca, capitolo quinto); infine a seguire per sempre Cristo nostro Signore (Matteo, capitolo quarto, e Marco, capitolo primo).',
      'Chiamò Filippo, come è in Giovanni al capitolo primo, e Matteo, come lo stesso Matteo dice al capitolo nono.',
      'Chiamò gli altri apostoli. E si considerino tre cose: come gli apostoli erano di condizione rozza e bassa; la dignità a cui furono chiamati così soavemente; i doni e le grazie con cui furono elevati.',
    ],
  },
  {
    id: 'cana',
    fase: 'seconda',
    titolo: 'Le nozze di Cana',
    num: '[276]',
    brano: { rif: 'Gv 2,1-11', q: 'Gv2,1-11' },
    punti: [
      'Cristo nostro Signore fu invitato alle nozze con i suoi discepoli.',
      'La Madre fa notare al Figlio la mancanza del vino, dicendo: «Non hanno vino»; e ordinò ai servitori: «Fate qualunque cosa vi dirà».',
      '«Cambiò l’acqua in vino, e manifestò la sua gloria, e i suoi discepoli credettero in lui».',
    ],
  },
  {
    id: 'venditori',
    fase: 'seconda',
    titolo: 'I venditori cacciati dal tempio',
    num: '[277]',
    brano: { rif: 'Gv 2,13-22', q: 'Gv2,13-22' },
    punti: [
      'Cacciò dal tempio tutti quelli che vendevano, con una frusta fatta di corde.',
      'Rovesciò i tavoli e il denaro dei ricchi cambiavalute che erano nel tempio.',
      'Ai poveri che vendevano colombe disse con mansuetudine: «Togliete queste cose di qui, e non fate della mia casa una casa di mercato».',
    ],
  },
  {
    id: 'monte',
    fase: 'seconda',
    titolo: 'Il discorso della montagna',
    num: '[161] · [278]',
    brano: { rif: 'Mt 5,1-48', q: 'Mt5,1-48' },
    punti: [
      'Ai suoi amati discepoli, in disparte, parla delle otto beatitudini: «Beati i poveri di spirito, i miti, i misericordiosi, quelli che piangono, quelli che hanno fame e sete di giustizia, i puri di cuore, i pacifici, e quelli che patiscono persecuzione».',
      'Li esorta a usare bene i loro talenti: «Così risplenda la vostra luce davanti agli uomini, perché vedano le vostre opere buone e glorifichino il Padre vostro che è nei cieli».',
      'Si mostra non trasgressore della legge ma suo compimento, spiegando il precetto di non uccidere, di non commettere adulterio, di non spergiurare, e di amare i nemici: «Io vi dico: amate i vostri nemici e fate del bene a quelli che vi odiano».',
    ],
  },
  {
    id: 'tempesta',
    fase: 'seconda',
    titolo: 'La tempesta sedata',
    num: '[161] · [279]',
    brano: { rif: 'Mt 8,23-27', q: 'Mt8,23-27' },
    punti: [
      'Mentre Cristo nostro Signore dormiva sul mare, si levò una grande tempesta.',
      'I suoi discepoli, spaventati, lo svegliarono; ed egli li rimprovera per la poca fede: «Perché temete, uomini di poca fede?».',
      'Comandò ai venti e al mare di cessare, e il mare si fece tranquillo; e gli uomini si meravigliarono dicendo: «Chi è costui, al quale il vento e il mare obbediscono?».',
    ],
  },
  {
    id: 'acque',
    fase: 'seconda',
    titolo: 'Gesù cammina sulle acque',
    num: '[280]',
    brano: { rif: 'Mt 14,22-33', q: 'Mt14,22-33' },
    punti: [
      'Stando Cristo nostro Signore sul monte, fece salire i discepoli sulla barca; e congedata la folla, cominciò a pregare da solo.',
      'La barca era sbattuta dalle onde; Cristo viene camminando sull’acqua, e i discepoli pensavano che fosse un fantasma.',
      'Cristo dice loro: «Sono io, non temete». Pietro, per suo comando, venne a lui camminando sull’acqua; e dubitando cominciò ad affondare; ma Cristo nostro Signore lo salvò e lo rimproverò della sua poca fede; e quando entrò nella barca il vento cessò.',
    ],
  },
  {
    id: 'invio',
    fase: 'seconda',
    titolo: 'Gli apostoli mandati a predicare',
    num: '[281]',
    brano: { rif: 'Mt 10,1-16', q: 'Mt10,1-16' },
    punti: [
      'Cristo chiama i suoi amati discepoli e dà loro potere di scacciare i demoni e di curare tutte le malattie.',
      'Insegna loro prudenza e pazienza: «Ecco, io vi mando come pecore in mezzo ai lupi; siate dunque prudenti come serpenti e semplici come colombe».',
      'Dà loro il modo di andare: «Non vogliate possedere né oro né argento; ciò che gratuitamente ricevete, gratuitamente datelo»; e la materia della predicazione: «Andando predicherete dicendo: il regno dei cieli è vicino».',
    ],
  },
  {
    id: 'maddalena',
    fase: 'seconda',
    titolo: 'La conversione della Maddalena',
    num: '[282]',
    brano: { rif: 'Lc 7,36-50', q: 'Lc7,36-50' },
    punti: [
      'Entra la Maddalena dove Cristo nostro Signore è seduto a tavola in casa del fariseo, portando un vaso di alabastro pieno di unguento.',
      'Stando dietro al Signore, vicino ai suoi piedi, cominciò a bagnarli di lacrime, li asciugava con i capelli del suo capo, li baciava e li ungeva con l’unguento.',
      'Quando il fariseo accusa la Maddalena, Cristo parla in sua difesa: «Le sono perdonati molti peccati, perché ha molto amato»; e disse alla donna: «La tua fede ti ha salvata, va’ in pace».',
    ],
  },
  {
    id: 'pani',
    fase: 'seconda',
    titolo: 'Il pane per i cinquemila',
    num: '[283]',
    brano: { rif: 'Mt 14,13-21', q: 'Mt14,13-21' },
    punti: [
      'Facendosi tardi, i discepoli pregano Cristo di congedare la folla che era con lui.',
      'Cristo nostro Signore comandò che gli portassero i pani, fece sedere la gente, benedisse, spezzò e diede i pani ai discepoli, e i discepoli alla folla.',
      '«Mangiarono e furono saziati, e avanzarono dodici ceste».',
    ],
  },
  {
    id: 'trasfigurazione',
    fase: 'seconda',
    titolo: 'La Trasfigurazione',
    num: '[284]',
    brano: { rif: 'Mt 17,1-9', q: 'Mt17,1-9' },
    punti: [
      'Prendendo con sé i suoi amati discepoli Pietro, Giacomo e Giovanni, Cristo nostro Signore si trasfigurò: il suo volto risplendeva come il sole e le sue vesti come la neve.',
      'Parlava con Mosè ed Elia.',
      'Mentre Pietro diceva di fare tre tende, risuonò una voce dal cielo: «Questo è il mio Figlio amato, ascoltatelo»; i discepoli, udendola, caddero con la faccia a terra per il timore; e Cristo nostro Signore li toccò e disse: «Alzatevi e non temete; non dite a nessuno questa visione, finché il Figlio dell’uomo non sia risorto».',
    ],
  },
  {
    id: 'lazzaro',
    fase: 'seconda',
    titolo: 'La risurrezione di Lazzaro',
    num: '[161] · [285]',
    brano: { rif: 'Gv 11,1-45', q: 'Gv11,1-45' },
    punti: [
      'Marta e Maria fanno sapere a Cristo nostro Signore la malattia di Lazzaro; saputala, egli si trattenne due giorni, perché il miracolo fosse più evidente.',
      'Prima di risuscitarlo, chiede all’una e all’altra di credere, dicendo: «Io sono la risurrezione e la vita; chi crede in me, anche se è morto, vivrà».',
      'Lo risuscita dopo aver pianto e pregato; e il modo fu comandando: «Lazzaro, vieni fuori».',
    ],
  },
  {
    id: 'betania',
    fase: 'seconda',
    titolo: 'La cena a Betania',
    num: '[286]',
    brano: { rif: 'Mt 26,6-13', q: 'Mt26,6-13' },
    punti: [
      'Il Signore cena in casa di Simone il lebbroso, insieme con Lazzaro.',
      'Maria versa l’unguento sul capo di Cristo.',
      'Giuda mormora dicendo: «Perché questo spreco di unguento?»; ma egli scusa di nuovo la Maddalena: «Perché date fastidio a questa donna? Ha compiuto un’opera buona verso di me».',
    ],
  },
  {
    id: 'palme',
    fase: 'seconda',
    titolo: 'La domenica delle Palme',
    num: '[161] · [287]',
    brano: { rif: 'Mt 21,1-17', q: 'Mt21,1-17' },
    punti: [
      'Il Signore manda a prendere l’asina e il puledro, dicendo: «Scioglieteli e portateli a me; e se qualcuno vi dirà qualcosa, dite che il Signore ne ha bisogno, e subito li lascerà».',
      'Salì sull’asina, coperta con le vesti degli apostoli.',
      'Gli vanno incontro stendendo sulla strada i loro mantelli e i rami degli alberi, dicendo: «Salvaci, Figlio di Davide; benedetto colui che viene nel nome del Signore; salvaci nell’alto dei cieli».',
    ],
  },
  {
    id: 'tempio-predicazione',
    fase: 'seconda',
    titolo: 'La predicazione nel tempio',
    num: '[161] · [288]',
    brano: { rif: 'Lc 19,47-48', q: 'Lc19,47-48' },
    punti: [
      'Ogni giorno insegnava nel tempio.',
      'Finita la predicazione, poiché non c’era chi lo accogliesse in Gerusalemme, tornava a Betania.',
    ],
  },
  {
    id: 'elezione',
    fase: 'seconda',
    titolo: 'Il tempo dell’elezione',
    num: '[169]–[189]',
    grazia:
      'Chiedo a Dio nostro Signore che voglia muovere la mia volontà e mettere nella mia anima ciò che devo fare, che sia più a sua lode e gloria [180].',
    luogo:
      'Vedermi come al centro di una bilancia, per seguire ciò che sentirò essere più a gloria e lode di Dio nostro Signore e salvezza della mia anima [179].',
    storia:
      'In ogni buona elezione l’occhio della nostra intenzione deve essere semplice, guardando solo a ciò per cui sono creato; non tirando il fine verso il mezzo, ma il mezzo verso il fine [169]. Chi è già in uno stato non mutabile, come il matrimonio, invece di eleggere cerca come riformare e ordinare la propria vita e il proprio stato, quanto alla casa, alla famiglia, ai beni, all’esempio [189]: perché ciascuno tanto profitterà in tutte le cose spirituali quanto uscirà dal proprio amore, volere e interesse.',
    punti: [
      'I tre tempi della buona elezione: quando Dio muove e attrae la volontà senza che si possa dubitare, come fecero san Paolo e san Matteo; quando si acquista chiarezza per esperienza di consolazioni e desolazioni e del discernimento degli spiriti; il tempo tranquillo, quando l’anima non è agitata da vari spiriti e usa delle sue potenze naturali liberamente [175]–[177].',
      'Nel tempo tranquillo: mettermi davanti la cosa su cui voglio eleggere; considerare ragionando i vantaggi e gli svantaggi nel tenerla, e poi nel non tenerla; guardare dove più la ragione si inclina, secondo la maggiore mozione razionale e non una mozione sensuale [178]–[182].',
      'Le quattro regole del secondo modo: che l’amore che mi muove discenda dall’alto, dall’amore di Dio; guardare un uomo che non ho mai visto né conosciuto e considerare che cosa gli direi di scegliere; considerare come se fossi in punto di morte che misura vorrei aver tenuto; pensare come vorrei aver deciso nel giorno del giudizio [184]–[187].',
    ],
    colloquio:
      'Fatta l’elezione, vado con molta diligenza alla preghiera davanti a Dio nostro Signore e gliela offro, perché la sua divina maestà voglia riceverla e confermarla, se è suo maggior servizio e lode [183]. Un Padre nostro.',
  },

  // ── Terza settimana
  {
    id: 'cena',
    fase: 'terza',
    titolo: 'L’Ultima Cena',
    num: '[190]–[199] · [289]',
    brano: { rif: 'Gv 13,1-30', q: 'Gv13,1-30' },
    grazia: 'Chiedo dolore, sentimento e confusione, perché per i miei peccati il Signore va alla passione [193].',
    storia:
      'Da Betania Cristo nostro Signore manda due discepoli a Gerusalemme a preparare la cena, e poi vi va egli stesso con gli altri; mangiato l’agnello pasquale, lava loro i piedi, dà il suo santissimo corpo e il suo prezioso sangue, e fa loro un discorso, dopo che Giuda è uscito per vendere il suo Signore [191].',
    punti: [
      'Mangiò l’agnello pasquale con i suoi dodici apostoli, ai quali predisse la sua morte: «In verità vi dico che uno di voi mi tradirà».',
      'Lavò i piedi ai discepoli, anche a Giuda, cominciando da Pietro, che considerando la maestà del Signore e la propria bassezza diceva: «Signore, tu lavi i piedi a me?»; ma Pietro non sapeva che in quello dava esempio di umiltà, e per questo disse: «Vi ho dato l’esempio, perché facciate come io ho fatto».',
      'Istituì il santissimo sacrificio dell’Eucaristia, in grandissimo segno del suo amore, dicendo: «Prendete e mangiate». Finita la cena, Giuda esce a vendere Cristo nostro Signore.',
    ],
  },
  {
    id: 'orto',
    fase: 'terza',
    titolo: 'Dalla Cena all’orto',
    num: '[200]–[203] · [290]',
    brano: { rif: 'Mt 26,30-46', q: 'Mt26,30-46' },
    luogo:
      'Considerare la strada dal monte Sion alla valle di Giosafat, e l’orto: se largo, se lungo, di un modo o di un altro [202].',
    punti: [
      'Il Signore, finita la cena e cantato l’inno, andò al monte degli Ulivi con i discepoli pieni di paura; e lasciandone otto nel Getsemani disse: «Sedete qui, finché io vada là a pregare».',
      'Accompagnato da Pietro, Giacomo e Giovanni, pregò tre volte il Signore dicendo: «Padre, se è possibile, passi da me questo calice; tuttavia non si faccia la mia volontà, ma la tua»; e stando in agonia pregava più a lungo.',
      'Venne in tale timore che diceva: «L’anima mia è triste fino alla morte»; e sudò sangue così copioso che dice san Luca: «Il suo sudore era come gocce di sangue che cadevano a terra».',
    ],
  },
  {
    id: 'anna',
    fase: 'terza',
    titolo: 'Dall’orto alla casa di Anna',
    num: '[208] · [291]',
    brano: { rif: 'Lc 22,47-57', q: 'Lc22,47-57' },
    punti: [
      'Il Signore si lascia baciare da Giuda e prendere come un ladro; e dice loro: «Come contro un ladro siete usciti a prendermi con bastoni e armi, mentre ogni giorno ero con voi nel tempio a insegnare e non mi avete preso»; e dicendo: «Chi cercate?», i nemici caddero a terra.',
      'Pietro ferì un servo del pontefice, e il mite Signore gli disse: «Rimetti la tua spada al suo posto», e guarì la ferita del servo.',
      'Abbandonato dai discepoli, è portato da Anna, dove Pietro, che lo aveva seguito da lontano, lo rinnegò una volta; e a Cristo fu dato uno schiaffo: «Così rispondi al pontefice?».',
    ],
  },
  {
    id: 'caifa',
    fase: 'terza',
    titolo: 'Dalla casa di Anna a quella di Caifa',
    num: '[208] · [292]',
    brano: { rif: 'Mt 26,57-75', q: 'Mt26,57-75' },
    punti: [
      'Lo portano legato dalla casa di Anna a quella di Caifa, dove Pietro lo rinnegò due volte; e guardato dal Signore, «uscito fuori, pianse amaramente».',
      'Gesù rimase legato tutta quella notte.',
      'E quelli che lo tenevano prigioniero si burlavano di lui, lo percuotevano, gli coprivano il volto, gli davano schiaffi e gli chiedevano: «Indovina chi ti ha colpito»; e dicevano contro di lui altre bestemmie simili.',
    ],
  },
  {
    id: 'pilato',
    fase: 'terza',
    titolo: 'Dalla casa di Caifa a Pilato',
    num: '[208] · [293]',
    brano: { rif: 'Lc 23,1-5', q: 'Lc23,1-5' },
    punti: [
      'Tutta la folla dei giudei lo porta da Pilato, e davanti a lui lo accusano: «Abbiamo trovato costui che sobillava il nostro popolo e impediva di pagare il tributo a Cesare».',
      'Dopo averlo esaminato una volta e un’altra, Pilato dice: «Io non trovo alcuna colpa».',
      'Gli fu preferito Barabba, ladro: «Gridarono tutti: non costui, ma Barabba».',
    ],
  },
  {
    id: 'erode',
    fase: 'terza',
    titolo: 'Da Pilato a Erode',
    num: '[208] · [294]',
    brano: { rif: 'Lc 23,6-11', q: 'Lc23,6-11' },
    punti: [
      'Pilato mandò Gesù galileo da Erode, tetrarca di Galilea.',
      'Erode, curioso, lo interrogò a lungo; ed egli non gli rispondeva nulla, benché gli scribi e i sacerdoti lo accusassero con insistenza.',
      'Erode lo disprezzò con i suoi soldati, vestendolo di una veste bianca.',
    ],
  },
  {
    id: 'ecce-homo',
    fase: 'terza',
    titolo: 'Da Erode di nuovo a Pilato',
    num: '[208] · [295]',
    brano: { rif: 'Gv 19,1-7', q: 'Gv19,1-7' },
    punti: [
      'Erode lo rimanda a Pilato; per questo diventano amici, mentre prima erano nemici.',
      'Pilato prese Gesù e lo fece flagellare; i soldati fecero una corona di spine e gliela posero sul capo, lo vestirono di porpora, venivano da lui e dicevano: «Salve, re dei giudei», e gli davano schiaffi.',
      'Lo condusse fuori davanti a tutti: «Uscì dunque Gesù, coronato di spine e vestito di porpora; e Pilato disse loro: ecco l’uomo»; e quando lo videro, i pontefici gridavano: «Crocifiggilo, crocifiggilo».',
    ],
  },
  {
    id: 'via-croce',
    fase: 'terza',
    titolo: 'Da Pilato alla crocifissione',
    num: '[208] · [296]',
    brano: { rif: 'Gv 19,13-22', q: 'Gv19,13-22' },
    punti: [
      'Pilato, seduto come giudice, lo consegnò loro perché lo crocifiggessero, dopo che i giudei lo avevano rinnegato come re dicendo: «Non abbiamo altro re che Cesare».',
      'Portava la croce sulle spalle, e non potendola portare, fu costretto Simone di Cirene a portarla dietro a Gesù.',
      'Lo crocifissero in mezzo a due ladroni, ponendo questo titolo: «Gesù nazareno, re dei giudei».',
    ],
  },
  {
    id: 'croce',
    fase: 'terza',
    titolo: 'In croce',
    num: '[208] · [297]',
    brano: { rif: 'Gv 19,23-37', q: 'Gv19,23-37' },
    punti: [
      'Disse sette parole sulla croce: pregò per quelli che lo crocifiggevano; perdonò il ladrone; affidò Giovanni a sua Madre e la Madre a Giovanni; disse ad alta voce: «Ho sete», e gli diedero fiele e aceto; disse che era abbandonato; disse: «È compiuto»; disse: «Padre, nelle tue mani affido il mio spirito».',
      'Il sole si oscurò, le pietre si spezzarono, i sepolcri si aprirono, il velo del tempio si squarciò in due parti dall’alto in basso.',
      'Lo bestemmiano dicendo: «Tu che distruggi il tempio di Dio, scendi dalla croce»; furono divise le sue vesti; ferito al costato dalla lancia, ne uscì acqua e sangue.',
    ],
  },
  {
    id: 'sepolcro',
    fase: 'terza',
    titolo: 'Dalla croce al sepolcro',
    num: '[208] · [298]',
    brano: { rif: 'Gv 19,38-42', q: 'Gv19,38-42' },
    punti: [
      'Fu deposto dalla croce da Giuseppe e Nicodemo, in presenza della Madre addolorata.',
      'Il corpo fu portato al sepolcro, unto e sepolto.',
      'Furono poste le guardie.',
    ],
  },
  {
    id: 'solitudine',
    fase: 'terza',
    titolo: 'Tutta la passione; la solitudine di Maria',
    num: '[208] settimo giorno',
    storia:
      'Il settimo giorno della terza settimana si contempla tutta la passione insieme; e per tutta la giornata, quanto più spesso si può, come il corpo santissimo di Cristo rimase separato dall’anima, dove e come fu sepolto; la solitudine di nostra Signora, con tanto dolore e fatica; e poi quella dei discepoli [208].',
    punti: [
      'Ripercorrere tutta la passione, dalla Cena al sepolcro, fermandomi dove ho sentito di più.',
      'Considerare il corpo di Cristo sepolto, separato dall’anima, e dove e come fu posto nel sepolcro.',
      'Considerare la solitudine di nostra Signora, con tanto dolore e fatica; e poi quella dei discepoli.',
    ],
  },

  // ── Quarta settimana
  {
    id: 'apparizione-maria',
    fase: 'quarta',
    titolo: 'Il Risorto appare a sua Madre',
    num: '[218]–[225] · [299]',
    storia:
      'Dopo che Cristo spirò in croce, il corpo rimase separato dall’anima, sempre unito alla Divinità; l’anima beata discese agli inferi, anch’essa unita alla Divinità, e liberate le anime giuste, venendo al sepolcro e risorto, apparve alla sua benedetta Madre in corpo e anima [219].',
    luogo:
      'Vedere la disposizione del santo sepolcro, e il luogo o casa di nostra Signora, guardandone le parti in particolare, la stanza, l’oratorio [220].',
    punti: [
      'Apparve alla Vergine Maria: questo, benché la Scrittura non lo dica, si ritiene detto quando dice che apparve a tanti altri; perché la Scrittura suppone che abbiamo intelletto, come sta scritto: «Anche voi siete senza intelletto?» [299].',
      'Vedere le persone, udire ciò che dicono, guardare ciò che fanno, come nella contemplazione della Cena [222].',
    ],
  },
  {
    id: 'apparizione-donne-sepolcro',
    fase: 'quarta',
    titolo: 'Le donne al sepolcro',
    num: '[300]',
    brano: { rif: 'Mc 16,1-11', q: 'Mc16,1-11' },
    punti: [
      'Vanno molto di buon mattino Maria Maddalena, Maria di Giacomo e Salome al sepolcro, dicendo: «Chi ci rotolerà via la pietra dalla porta del sepolcro?».',
      'Vedono la pietra rotolata e l’angelo che dice: «Cercate Gesù nazareno; è risorto, non è qui».',
      'Apparve a Maria, che era rimasta vicino al sepolcro dopo che le altre se n’erano andate.',
    ],
  },
  {
    id: 'apparizione-donne-via',
    fase: 'quarta',
    titolo: 'Il Risorto incontra le donne sulla via',
    num: '[301]',
    brano: { rif: 'Mt 28,8-10', q: 'Mt28,8-10' },
    punti: [
      'Escono queste Marie dal sepolcro con timore e grande gioia, volendo annunciare ai discepoli la risurrezione del Signore.',
      'Cristo nostro Signore apparve loro sulla via dicendo: «Salve»; ed esse si avvicinarono, si gettarono ai suoi piedi e lo adorarono.',
      'Gesù dice loro: «Non temete; andate e dite ai miei fratelli che vadano in Galilea, perché là mi vedranno».',
    ],
  },
  {
    id: 'apparizione-pietro',
    fase: 'quarta',
    titolo: 'Pietro al sepolcro',
    num: '[302]',
    brano: { rif: 'Lc 24,9-12.33-34', q: 'Lc24,9-12.33-34' },
    punti: [
      'Udito dalle donne che Cristo era risorto, Pietro andò in fretta al sepolcro.',
      'Entrando nel sepolcro vide soltanto i panni con cui era stato coperto il corpo di Cristo nostro Signore, e nient’altro.',
      'Mentre Pietro pensava a queste cose, Cristo gli apparve; e per questo gli apostoli dicevano: «Davvero il Signore è risorto ed è apparso a Simone».',
    ],
  },
  {
    id: 'emmaus',
    fase: 'quarta',
    titolo: 'I discepoli di Emmaus',
    num: '[303]',
    brano: { rif: 'Lc 24,13-35', q: 'Lc24,13-35' },
    punti: [
      'Appare ai discepoli che andavano a Emmaus parlando di Cristo.',
      'Li rimprovera mostrando con le Scritture che Cristo doveva morire e risorgere: «O stolti e lenti di cuore a credere a tutto ciò che hanno detto i profeti! Non era necessario che Cristo patisse e così entrasse nella sua gloria?».',
      'Su loro preghiera si ferma là, e rimase con loro finché, comunicandoli, scomparve; ed essi, tornando, dissero ai discepoli come lo avevano riconosciuto nella comunione.',
    ],
  },
  {
    id: 'cenacolo',
    fase: 'quarta',
    titolo: 'Nel cenacolo, a porte chiuse',
    num: '[304]',
    brano: { rif: 'Gv 20,19-23', q: 'Gv20,19-23' },
    punti: [
      'I discepoli erano riuniti «per paura dei giudei», eccetto Tommaso.',
      'Gesù apparve loro a porte chiuse, e stando in mezzo a loro dice: «Pace a voi».',
      'Dà loro lo Spirito Santo dicendo: «Ricevete lo Spirito Santo; a coloro ai quali perdonerete i peccati saranno perdonati».',
    ],
  },
  {
    id: 'tommaso',
    fase: 'quarta',
    titolo: 'Tommaso',
    num: '[305]',
    brano: { rif: 'Gv 20,24-29', q: 'Gv20,24-29' },
    punti: [
      'Tommaso, incredulo perché assente all’apparizione precedente, dice: «Se non vedo, non crederò».',
      'Gesù appare loro otto giorni dopo, a porte chiuse, e dice a Tommaso: «Metti qui il tuo dito e vedi la verità, e non essere incredulo ma fedele».',
      'Tommaso credette dicendo: «Mio Signore e mio Dio»; e Cristo gli dice: «Beati quelli che non hanno visto e hanno creduto».',
    ],
  },
  {
    id: 'tiberiade',
    fase: 'quarta',
    titolo: 'Sul lago di Tiberiade',
    num: '[306]',
    brano: { rif: 'Gv 21,1-17', q: 'Gv21,1-17' },
    punti: [
      'Gesù appare a sette discepoli che pescavano e per tutta la notte non avevano preso nulla; e gettando la rete per suo comando, «non riuscivano a tirarla per la quantità di pesci».',
      'Per questo miracolo Giovanni lo riconobbe e disse a Pietro: «È il Signore»; e Pietro si gettò in mare e venne a Cristo.',
      'Diede loro da mangiare un po’ di pesce arrostito e un favo di miele; e affidò le pecore a Pietro, dopo averlo interrogato tre volte sulla carità, e gli disse: «Pasci le mie pecore».',
    ],
  },
  {
    id: 'monte-galilea',
    fase: 'quarta',
    titolo: 'Sul monte in Galilea',
    num: '[307]',
    brano: { rif: 'Mt 28,16-20', q: 'Mt28,16-20' },
    punti: [
      'I discepoli, per comando del Signore, vanno al monte Tabor.',
      'Cristo appare loro e dice: «Mi è stato dato ogni potere in cielo e in terra».',
      'Li mandò per tutto il mondo a predicare dicendo: «Andate e ammaestrate tutte le genti, battezzandole nel nome del Padre e del Figlio e dello Spirito Santo».',
    ],
  },
  {
    id: 'altre-apparizioni',
    fase: 'quarta',
    titolo: 'Le altre apparizioni',
    num: '[308]–[311]',
    brano: { rif: '1 Cor 15,3-8', q: '1Cor15,3-8' },
    punti: [
      '«Poi fu visto da più di cinquecento fratelli insieme» [308]; «apparve poi a Giacomo» [309].',
      'Apparve a Giuseppe d’Arimatea, come piamente si medita e si legge nella vita dei santi [310].',
      'Apparve a san Paolo dopo l’Ascensione: «Ultimo di tutti apparve anche a me, come a un aborto» [311].',
    ],
  },
  {
    id: 'ascensione',
    fase: 'quarta',
    titolo: 'L’Ascensione',
    num: '[312]',
    brano: { rif: 'At 1,1-12', q: 'At1,1-12' },
    punti: [
      'Dopo essere apparso agli apostoli per quaranta giorni, con molte prove e segni e parlando del regno di Dio, comandò loro di attendere a Gerusalemme lo Spirito Santo promesso.',
      'Li condusse al monte degli Ulivi, «e in loro presenza fu elevato, e una nube lo sottrasse ai loro occhi».',
      'Mentre guardano il cielo, gli angeli dicono loro: «Uomini di Galilea, perché state a guardare il cielo? Questo Gesù, che è stato portato via dai vostri occhi al cielo, verrà allo stesso modo in cui l’avete visto andare in cielo».',
    ],
  },
  {
    id: 'contemplatio',
    fase: 'quarta',
    titolo: 'Contemplazione per ottenere amore',
    num: '[230]–[237]',
    grazia:
      'Chiedo conoscenza interna di tanto bene ricevuto, perché io, riconoscendolo interamente, possa in tutto amare e servire la sua divina maestà [233].',
    luogo: 'Vedere come sto davanti a Dio nostro Signore, agli angeli, ai santi che intercedono per me [232].',
    storia:
      'Due premesse: l’amore si deve porre più nelle opere che nelle parole; e l’amore consiste nella comunicazione reciproca: nel dare e comunicare l’amante all’amato ciò che ha, o di ciò che ha o può, e così l’amato all’amante [230]–[231].',
    punti: [
      'Richiamare alla memoria i benefici ricevuti, della creazione, della redenzione e i doni particolari, ponderando con molto affetto quanto Dio nostro Signore ha fatto per me, quanto mi ha dato di ciò che ha, e come lo stesso Signore desidera darmi se stesso. E riflettere su ciò che io, con molta ragione e giustizia, devo offrire e dare da parte mia: tutte le mie cose e me stesso con esse [234].',
      'Guardare come Dio abita nelle creature: negli elementi dando l’essere, nelle piante la vita vegetativa, negli animali il sentire, negli uomini l’intendere; e così in me, dandomi l’essere, l’anima, il sentire, l’intendere; e facendo di me un tempio, creato a somiglianza e immagine della sua divina maestà [235].',
      'Considerare come Dio lavora e fatica per me in tutte le cose create sulla faccia della terra: si comporta come uno che lavora. E guardare come tutti i beni e i doni discendono dall’alto, come la mia misurata potenza dalla somma e infinita, e così la giustizia, la bontà, la pietà, la misericordia: come dal sole discendono i raggi, dalla fonte le acque [236]–[237].',
    ],
    colloquio:
      '«Prendi, Signore, e ricevi tutta la mia libertà, la mia memoria, il mio intelletto e tutta la mia volontà, tutto ciò che ho e possiedo. Tu me lo hai dato, a te, Signore, lo ridono. Tutto è tuo: disponine secondo ogni tua volontà. Dammi il tuo amore e la tua grazia: questa mi basta» [234]. Un Padre nostro.',
  },
];

// Regole per il discernimento degli spiriti [313]–[336].
// Annotazioni 9 e 10: a chi è nella prima settimana non si danno quelle della seconda.
export const REGOLE = {
  prima: {
    titolo: 'Regole della prima settimana',
    intro:
      'Regole per sentire e conoscere in qualche modo le varie mozioni che si producono nell’anima: le buone per accoglierle, le cattive per respingerle [313].',
    testi: [
      'Nelle persone che vanno di peccato mortale in peccato mortale, il nemico suole proporre piaceri apparenti, facendo immaginare diletti sensuali, per mantenerle e farle crescere nei loro vizi; in queste persone il buono spirito usa il modo contrario, pungendo e rimordendo la coscienza con il giudizio della ragione [314].',
      'Nelle persone che vanno purificandosi intensamente dai loro peccati, e salgono di bene in meglio nel servizio di Dio, accade il contrario: è proprio del cattivo spirito mordere, rattristare e porre impedimenti, inquietando con false ragioni, perché non si vada avanti; ed è proprio del buono dare coraggio e forze, consolazioni, lacrime, ispirazioni e quiete, facilitando e togliendo ogni impedimento, perché si proceda nel bene [315].',
      'Chiamo consolazione quando nell’anima si produce una mozione interiore con cui l’anima arriva a infiammarsi d’amore per il suo Creatore e Signore, e di conseguenza non può amare nessuna cosa creata in sé, ma solo nel Creatore di tutte. Chiamo consolazione ogni aumento di speranza, fede e carità, e ogni letizia interna che chiama e attrae alle cose celesti, quietando e pacificando l’anima nel suo Creatore e Signore [316].',
      'Chiamo desolazione tutto il contrario: oscurità dell’anima, turbamento, mozione alle cose basse e terrene, inquietudine di varie agitazioni e tentazioni, che muove alla sfiducia, senza speranza, senza amore, trovandosi tutta pigra, tiepida, triste e come separata dal suo Creatore e Signore [317].',
      'In tempo di desolazione non fare mai mutamenti, ma restare fermi e costanti nei propositi e nella determinazione in cui si era il giorno prima della desolazione, o nella consolazione precedente. Perché come nella consolazione ci guida e consiglia di più il buono spirito, così nella desolazione il cattivo, con i cui consigli non possiamo prendere la strada giusta [318].',
      'Se nella desolazione non dobbiamo mutare i propositi, giova molto mutare intensamente noi stessi contro la desolazione: insistere di più nella preghiera, nella meditazione, nell’esaminarsi molto [319].',
      'Chi è in desolazione consideri come il Signore lo ha lasciato alla prova nelle sue potenze naturali, perché resista alle varie agitazioni e tentazioni del nemico; e può farlo con l’aiuto divino, che sempre gli resta, anche se non lo sente chiaramente [320].',
      'Chi è in desolazione si sforzi di stare nella pazienza, che è contraria alle vessazioni che gli vengono, e pensi che presto sarà consolato [321].',
      'Tre sono le cause principali per cui ci troviamo desolati: perché siamo tiepidi, pigri o negligenti nei nostri esercizi spirituali; per provarci, quanto valiamo senza tanto compenso di consolazioni; per darci vera conoscenza che non dipende da noi avere devozione crescente, amore intenso, lacrime o altra consolazione spirituale, ma che tutto è dono e grazia di Dio nostro Signore; e perché non facciamo il nido in casa d’altri, attribuendo a noi la devozione [322].',
      'Chi è in consolazione pensi come si comporterà nella desolazione che poi verrà, prendendo nuove forze per allora [323].',
      'Chi è consolato procuri di umiliarsi e abbassarsi quanto può, pensando quanto poco vale nel tempo della desolazione senza tale grazia. Al contrario, chi è in desolazione pensi che può molto con la grazia sufficiente per resistere a tutti i suoi nemici, prendendo forza nel suo Creatore e Signore [324].',
      'Il nemico è debole davanti a chi gli resiste e forte davanti a chi cede: quando chi si esercita nelle cose spirituali affronta con decisione le tentazioni, facendo esattamente l’opposto, il nemico si indebolisce e fugge; se invece comincia a temere e a perdersi d’animo, non c’è bestia così feroce sulla terra come il nemico della natura umana [325].',
      'Il nemico vuole restare segreto e non essere scoperto: quando porta le sue astuzie e persuasioni all’anima giusta, vuole che siano ricevute e tenute in segreto; ma quando l’anima le scopre al suo buon confessore o a un’altra persona spirituale che conosca i suoi inganni, ne è molto contrariato, perché capisce che non potrà riuscire [326].',
      'Il nemico si comporta come un capitano che vuole vincere: come chi, guardate le forze di un castello, lo attacca dalla parte più debole, così il nemico della natura umana gira intorno a tutte le nostre virtù teologali, cardinali e morali, e da dove ci trova più deboli e bisognosi per la nostra salvezza, da lì ci attacca [327].',
    ],
  },
  seconda: {
    titolo: 'Regole della seconda settimana',
    intro: 'Regole per lo stesso effetto con maggiore discernimento degli spiriti [328].',
    testi: [
      'È proprio di Dio e dei suoi angeli, nelle loro mozioni, dare vera allegria e gioia spirituale, togliendo ogni tristezza e turbamento che il nemico induce; del quale è proprio combattere contro tale allegria e consolazione, portando ragioni apparenti, sottigliezze e continue fallacie [329].',
      'Solo Dio nostro Signore dà consolazione all’anima senza causa precedente: perché è proprio del Creatore entrare, uscire, fare mozione nell’anima, portandola tutta nell’amore della sua divina maestà. Dico senza causa: senza alcun sentimento o conoscenza previa di un oggetto per cui venga tale consolazione [330].',
      'Con causa può consolare l’anima sia l’angelo buono sia il cattivo, per fini contrari: il buono perché l’anima cresca e salga di bene in meglio; il cattivo per il contrario, per poi portarla alla sua intenzione dannosa [331].',
      'È proprio dell’angelo cattivo, che si trasforma in angelo di luce, entrare con l’anima devota e uscire con sé: portare pensieri buoni e santi conformi a quell’anima giusta, e poi, poco a poco, uscirne portando l’anima ai suoi inganni coperti e alle sue intenzioni perverse [332].',
      'Dobbiamo badare molto al corso dei pensieri: se il principio, il mezzo e la fine sono tutti buoni, inclinati a ogni bene, è segno dell’angelo buono; ma se finiscono in qualcosa di cattivo, o distraente, o meno buono di ciò che l’anima si era proposta, o la indeboliscono, inquietano o turbano, togliendole la pace, la tranquillità e la quiete che aveva, è chiaro segno che vengono dal cattivo spirito [333].',
      'Quando il nemico della natura umana è stato sentito e riconosciuto dalla sua coda serpentina e dal fine cattivo a cui induce, giova alla persona tentata guardare subito il corso dei buoni pensieri che le portò, il loro principio, e come poco a poco cercò di farla scendere dalla soavità e gioia spirituale in cui era; perché con questa esperienza, conosciuta e annotata, si guardi in futuro dai suoi soliti inganni [334].',
      'In quelli che procedono di bene in meglio, l’angelo buono tocca l’anima dolcemente, leggermente e soavemente, come una goccia d’acqua che entra in una spugna; il cattivo tocca acutamente, con rumore e inquietudine, come quando la goccia d’acqua cade sulla pietra. In quelli che procedono di male in peggio accade il contrario: perché quando l’anima è contraria, gli spiriti entrano con strepito; quando è simile, entrano in silenzio, come in casa propria a porta aperta [335].',
      'Quando la consolazione è senza causa, benché in essa non ci sia inganno, la persona spirituale deve distinguere con molta vigilanza il tempo proprio della consolazione dal tempo seguente, in cui l’anima resta ancora calda e favorita dai resti della consolazione passata: perché spesso in questo secondo tempo forma propositi e pareri che non vengono immediatamente da Dio nostro Signore, e che vanno esaminati molto bene prima di dar loro pieno credito e metterli in opera [336].',
    ],
  },
};

const PER_FASE = Object.fromEntries(FASI.map((f) => [f.k, f]));

// Ogni tappa completa: i campi che mancano li prende dalla sua settimana.
export const TAPPE = T.map((t, i) => {
  const f = PER_FASE[t.fase];
  return {
    ...t,
    n: i + 1,
    fase: f.k,
    faseNome: f.nome,
    grazia: t.grazia || f.grazia,
    graziaNota: t.grazia ? null : f.graziaNota || null,
    luogo: t.luogo || f.luogo,
    colloquio: t.colloquio || f.colloquio,
    punti: [...t.punti, ...(f.puntiAggiunti || [])],
    regole: f.regole,
    brano: t.brano
      ? { rif: t.brano.rif, url: `https://www.laparola.net/testo.php?riferimento=${encodeURIComponent(t.brano.q)}&versioni[]=C.E.I.` }
      : null,
  };
});
