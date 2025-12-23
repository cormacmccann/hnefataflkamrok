export type Language = 'en' | 'swe' | 'ga' | 'gd' | 'cy' | 'ang';

export interface Translations {
  // App title and branding
  appName: string;
  tagline: string;
  subtitle: string;
  
  // Game setup
  selectVariant: string;
  chooseSide: string;
  attacker: string;
  attackers: string;
  defender: string;
  defenders: string;
  difficulty: string;
  beginner: string;
  easy: string;
  medium: string;
  hard: string;
  valhalla: string;
  
  // Game modes
  play: string;
  watchDemo: string;
  demoMode: string;
  exitDemo: string;
  watchAI: string;
  
  // Tutorial
  tutorial: string;
  tutorialSteps: {
    king: { title: string; description: string };
    defender: { title: string; description: string };
    attacker: { title: string; description: string };
    capture: { title: string; description: string };
    victory: { title: string; description: string };
  };
  previous: string;
  next: string;
  skipTutorial: string;
  learnGame: string;
  stepOf: string;
  startPlaying: string;
  viewTutorialAgain: string;
  
  // Rules
  rules: string;
  runeTitle: string;
  basics: string;
  movement: string;
  strategy: string;
  theSetup: string;
  setupDescription: string;
  attackersDesc: string;
  defendersDesc: string;
  kingDesc: string;
  victoryConditions: string;
  defendersWin: string;
  attackersWin: string;
  specialSquares: string;
  corners: string;
  cornersDesc: string;
  throne: string;
  throneDesc: string;
  howPiecesMove: string;
  movementDesc: string;
  capturingPieces: string;
  capturingDesc: string;
  capturingKing: string;
  capturingKingDesc: string;
  defenderTips: string;
  defenderTipsDesc: string;
  attackerTips: string;
  attackerTipsDesc: string;
  
  // Variant rules
  variantRules: string;
  kingArmed: string;
  kingArmedDesc: string;
  edgeEscape: string;
  edgeEscapeDesc: string;
  shieldwallCapture: string;
  shieldwallCaptureDesc: string;
  
  // Game UI
  currentTurn: string;
  yourTurn: string;
  aiThinking: string;
  youPlayAs: string;
  moveHistory: string;
  noMovesYet: string;
  newGame: string;
  undo: string;
  playAs: string;
  protectKing: string;
  captureKing: string;
  attackersFirst: string;
  youStart: string;
  aiStarts: string;
  viewMap: string;
  
  // Victory
  victory: string;
  defeat: string;
  youTriumphed: string;
  youFallen: string;
  areVictorious: string;
  haveClaimedVictory: string;
  playAgain: string;
  backToSetup: string;
  
  // Map
  spreadOfTafl: string;
  tradeRoutes: string;
  clickLocation: string;
  
  // Historical context
  origin: string;
  era: string;
  history: string;
  
  // Demo explanations
  kingAdvances: string;
  kingRepositions: string;
  attackersSiege: string;
  defendersManeuver: string;
  
  // Volume
  music: string;
  sfx: string;
  
  // Start game
  startGame: string;
  
  // Language names
  languageName: string;
  
  // Fidchell-specific
  fidchell: {
    navelStone: string;
    sacredWeb: string;
    connectionVictory: string;
    circularBoard: string;
    whiteConnects: string;
    blackBlocks: string;
    equalForces: string;
    createPath: string;
    blockPath: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Tafl',
    tagline: 'The Ancient Game of Strategy',
    subtitle: 'Norse & Celtic Board Games of the Ancient World',
    selectVariant: 'Select Variant',
    chooseSide: 'Choose Your Side',
    attacker: 'Attacker',
    attackers: 'Attackers',
    defender: 'Defender',
    defenders: 'Defenders',
    difficulty: 'Difficulty',
    beginner: 'Beginner',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    valhalla: 'Valhalla',
    play: 'Play',
    watchDemo: 'Watch Demo',
    demoMode: 'Demo Mode',
    exitDemo: 'Exit Demo',
    watchAI: 'Watch the AI play both sides',
    tutorial: 'Tutorial',
    tutorialSteps: {
      king: { title: 'The King', description: 'The golden King piece starts at the center. Your goal as defender is to escort the King to any corner square to win.' },
      defender: { title: 'Defenders', description: 'Light pieces protect the King. They can capture attackers by sandwiching them between two pieces.' },
      attacker: { title: 'Attackers', description: 'Dark pieces start on the edges. They must capture the King by surrounding it on all four sides.' },
      capture: { title: 'Capturing', description: 'Trap enemy pieces between two of yours (horizontally or vertically) to capture them. The throne and corners count as allies.' },
      victory: { title: 'Victory', description: 'Defenders win when the King reaches a corner. Attackers win when the King is surrounded on all four sides.' },
    },
    previous: 'Previous',
    next: 'Next',
    skipTutorial: 'Skip Tutorial',
    rules: 'Rules',
    runeTitle: 'ᚺᚾᛖᚠᚨᛏᚨᚠᛚ — Hnefatafl Rules',
    basics: 'Basics',
    movement: 'Movement',
    strategy: 'Strategy',
    theSetup: 'The Setup',
    setupDescription: 'Hnefatafl ("King\'s Table") is an ancient strategy game. Two players face off in an asymmetric battle:',
    attackersDesc: 'Start on the edges, outnumber defenders 2:1',
    defendersDesc: 'Protect the King in the center',
    kingDesc: 'Must escape to any corner',
    victoryConditions: 'Victory Conditions',
    defendersWin: 'The King reaches any corner square',
    attackersWin: 'The King is captured (surrounded on all 4 sides)',
    specialSquares: 'Special Squares',
    corners: 'Corners (ᛉ)',
    cornersDesc: 'Only the King may enter. Escape points for defenders.',
    throne: 'Throne (ᚦ)',
    throneDesc: 'The central square. Only the King may occupy it after leaving.',
    howPiecesMove: 'How Pieces Move',
    movementDesc: 'All pieces move the same way: any number of squares horizontally or vertically (like a rook in chess). Pieces cannot jump over other pieces or move diagonally.',
    capturingPieces: 'Capturing Pieces',
    capturingDesc: 'Capture an enemy by trapping it between two of your pieces (custodial capture). The capture happens along a row or column, not diagonally.',
    capturingKing: 'Capturing the King',
    capturingKingDesc: 'The King must be surrounded on all four sides to be captured. The throne and corners can act as the fourth side if the King is adjacent.',
    defenderTips: 'Defender Tips',
    defenderTipsDesc: 'Create multiple escape routes for the King. Force attackers to defend multiple corners at once. Sacrifice pieces strategically to open paths.',
    attackerTips: 'Attacker Tips',
    attackerTipsDesc: 'Control the edges and corners first. Create a net around the King. Be patient and tighten the noose gradually.',
    variantRules: 'Variant Rules',
    kingArmed: 'King Armed',
    kingArmedDesc: 'The King can participate in captures',
    edgeEscape: 'Edge Escape',
    edgeEscapeDesc: 'King can escape via any edge, not just corners',
    shieldwallCapture: 'Shieldwall Capture',
    shieldwallCaptureDesc: 'Multiple pieces against an edge can be captured at once',
    currentTurn: 'Current Turn',
    yourTurn: 'Your turn',
    aiThinking: 'AI thinking...',
    youPlayAs: 'You play as',
    moveHistory: 'Move History',
    noMovesYet: 'No moves yet',
    newGame: 'New Game',
    undo: 'Undo',
    victory: 'Victory!',
    defeat: 'Defeat',
    youTriumphed: 'You have triumphed!',
    youFallen: 'You have fallen.',
    areVictorious: 'are victorious.',
    haveClaimedVictory: 'have claimed victory.',
    playAgain: 'Play Again',
    backToSetup: 'Back to Setup',
    spreadOfTafl: 'The Spread of Tafl',
    tradeRoutes: 'Ancient Trade Routes',
    clickLocation: 'Click a location to select variant',
    origin: 'Origin',
    era: 'Era',
    history: 'History',
    kingAdvances: 'The King advances toward an escape square.',
    kingRepositions: 'The King repositions to create escape opportunities.',
    attackersSiege: 'Attackers tighten the siege around the King.',
    defendersManeuver: 'Defenders maneuver to protect the King.',
    music: 'Music',
    sfx: 'SFX',
    startGame: 'Start Game',
    languageName: 'English',
    learnGame: 'Learn the Game',
    stepOf: 'Step {current} of {total}',
    startPlaying: 'Start Playing',
    viewTutorialAgain: 'View Tutorial Again',
    playAs: 'Play As',
    protectKing: 'Protect the King',
    captureKing: 'Capture the King',
    attackersFirst: 'Attackers move first.',
    youStart: 'You start!',
    aiStarts: 'AI starts.',
    viewMap: 'View Map',
    fidchell: {
      navelStone: 'Navel Stone',
      sacredWeb: 'The Sacred Web',
      connectionVictory: 'Connection Victory',
      circularBoard: 'Circular Board',
      whiteConnects: 'White creates a path from center to edge',
      blackBlocks: 'Black blocks the connection',
      equalForces: 'Equal Forces',
      createPath: 'Create an unbroken chain to the outer edge',
      blockPath: 'Block white from reaching the edge',
    },
  },
  
  swe: {
    appName: 'Tafl',
    tagline: 'Det Forntida Strategispelet',
    subtitle: 'Nordiska & Keltiska Brädspel från Forntiden',
    selectVariant: 'Välj Variant',
    chooseSide: 'Välj Din Sida',
    attacker: 'Angripare',
    attackers: 'Angriparna',
    defender: 'Försvarare',
    defenders: 'Försvararna',
    difficulty: 'Svårighetsgrad',
    beginner: 'Nybörjare',
    easy: 'Lätt',
    medium: 'Medel',
    hard: 'Svår',
    valhalla: 'Valhall',
    play: 'Spela',
    watchDemo: 'Se Demo',
    demoMode: 'Demoläge',
    exitDemo: 'Avsluta Demo',
    watchAI: 'Se AI spela båda sidor',
    tutorial: 'Handledning',
    tutorialSteps: {
      king: { title: 'Kungen', description: 'Den gyllene kungspjäsen börjar i mitten. Ditt mål som försvarare är att eskortera Kungen till något hörn för att vinna.' },
      defender: { title: 'Försvarare', description: 'Ljusa pjäser skyddar Kungen. De kan fånga angripare genom att klämma dem mellan två pjäser.' },
      attacker: { title: 'Angripare', description: 'Mörka pjäser börjar vid kanterna. De måste fånga Kungen genom att omringa den på alla fyra sidor.' },
      capture: { title: 'Fångst', description: 'Fånga fiendepjäser genom att klämma dem mellan två av dina (horisontellt eller vertikalt). Tronen och hörnen räknas som allierade.' },
      victory: { title: 'Seger', description: 'Försvararna vinner när Kungen når ett hörn. Angriparna vinner när Kungen är omringad på alla fyra sidor.' },
    },
    previous: 'Föregående',
    next: 'Nästa',
    skipTutorial: 'Hoppa Över',
    rules: 'Regler',
    runeTitle: 'ᚺᚾᛖᚠᚨᛏᚨᚠᛚ — Hnefatafl Regler',
    basics: 'Grunder',
    movement: 'Rörelse',
    strategy: 'Strategi',
    theSetup: 'Uppställningen',
    setupDescription: 'Hnefatafl ("Kungabordet") är ett forntida strategispel. Två spelare möts i en asymmetrisk strid:',
    attackersDesc: 'Börjar vid kanterna, dubbelt så många som försvararna',
    defendersDesc: 'Skyddar Kungen i mitten',
    kingDesc: 'Måste fly till något hörn',
    victoryConditions: 'Segervillkor',
    defendersWin: 'Kungen når något hörn',
    attackersWin: 'Kungen fångas (omringad på alla 4 sidor)',
    specialSquares: 'Speciella Rutor',
    corners: 'Hörn (ᛉ)',
    cornersDesc: 'Endast Kungen får gå in. Flyktpunkter för försvararna.',
    throne: 'Tronen (ᚦ)',
    throneDesc: 'Den centrala rutan. Endast Kungen får ockupera den efter att ha lämnat.',
    howPiecesMove: 'Hur Pjäser Rör Sig',
    movementDesc: 'Alla pjäser rör sig likadant: valfritt antal rutor horisontellt eller vertikalt (som ett torn i schack). Pjäser kan inte hoppa över andra eller röra sig diagonalt.',
    capturingPieces: 'Fånga Pjäser',
    capturingDesc: 'Fånga en fiende genom att klämma den mellan två av dina pjäser (bevakningsfångst). Fångsten sker längs en rad eller kolumn, inte diagonalt.',
    capturingKing: 'Fånga Kungen',
    capturingKingDesc: 'Kungen måste omringas på alla fyra sidor för att fångas. Tronen och hörnen kan fungera som den fjärde sidan om Kungen är intilliggande.',
    defenderTips: 'Tips för Försvarare',
    defenderTipsDesc: 'Skapa flera flyktvägar för Kungen. Tvinga angriparna att försvara flera hörn samtidigt. Offra pjäser strategiskt för att öppna vägar.',
    attackerTips: 'Tips för Angripare',
    attackerTipsDesc: 'Kontrollera kanterna och hörnen först. Skapa ett nät runt Kungen. Ha tålamod och dra åt snaran gradvis.',
    variantRules: 'Variantregler',
    kingArmed: 'Beväpnad Kung',
    kingArmedDesc: 'Kungen kan delta i fångster',
    edgeEscape: 'Kantflykt',
    edgeEscapeDesc: 'Kungen kan fly via valfri kant, inte bara hörn',
    shieldwallCapture: 'Sköldmursfångst',
    shieldwallCaptureDesc: 'Flera pjäser mot en kant kan fångas samtidigt',
    currentTurn: 'Nuvarande Tur',
    yourTurn: 'Din tur',
    aiThinking: 'AI tänker...',
    youPlayAs: 'Du spelar som',
    moveHistory: 'Draghistorik',
    noMovesYet: 'Inga drag ännu',
    newGame: 'Nytt Spel',
    undo: 'Ångra',
    victory: 'Seger!',
    defeat: 'Nederlag',
    youTriumphed: 'Du har segrat!',
    youFallen: 'Du har fallit.',
    areVictorious: 'har segrat.',
    haveClaimedVictory: 'har erövrat segern.',
    playAgain: 'Spela Igen',
    backToSetup: 'Tillbaka',
    spreadOfTafl: 'Tafls Spridning',
    tradeRoutes: 'Forntida Handelsvägar',
    clickLocation: 'Klicka på en plats för att välja variant',
    origin: 'Ursprung',
    era: 'Tidsperiod',
    history: 'Historia',
    kingAdvances: 'Kungen avancerar mot en flyktruta.',
    kingRepositions: 'Kungen ompositionerar för att skapa flyktmöjligheter.',
    attackersSiege: 'Angriparna stramar åt belägringen runt Kungen.',
    defendersManeuver: 'Försvararna manövrerar för att skydda Kungen.',
    music: 'Musik',
    sfx: 'Ljud',
    startGame: 'Starta Spel',
    languageName: 'Svenska',
    learnGame: 'Lär dig spelet',
    stepOf: 'Steg {current} av {total}',
    startPlaying: 'Börja Spela',
    viewTutorialAgain: 'Se handledning igen',
    playAs: 'Spela som',
    protectKing: 'Skydda Kungen',
    captureKing: 'Fånga Kungen',
    attackersFirst: 'Angriparna börjar.',
    youStart: 'Du börjar!',
    aiStarts: 'AI börjar.',
    viewMap: 'Visa Karta',
    fidchell: {
      navelStone: 'Navelstenen',
      sacredWeb: 'Det Heliga Nätet',
      connectionVictory: 'Förbindelseseger',
      circularBoard: 'Cirkulärt Bräde',
      whiteConnects: 'Vit skapar en väg från centrum till kant',
      blackBlocks: 'Svart blockerar förbindelsen',
      equalForces: 'Lika Styrkor',
      createPath: 'Skapa en obruten kedja till ytterkanten',
      blockPath: 'Blockera vit från att nå kanten',
    },
  },
  
  ga: {
    appName: 'Ficheall',
    tagline: 'Cluiche Ársa na Straitéise',
    subtitle: 'Cluichí Cláir Lochlannach & Ceilteach ón Sean-Domhan',
    selectVariant: 'Roghnaigh Leagan',
    chooseSide: 'Roghnaigh Do Thaobh',
    attacker: 'Ionsaitheoir',
    attackers: 'Ionsaitheoirí',
    defender: 'Cosantóir',
    defenders: 'Cosantóirí',
    difficulty: 'Deacracht',
    beginner: 'Tosaíoch',
    easy: 'Éasca',
    medium: 'Meánach',
    hard: 'Deacair',
    valhalla: 'Valhalla',
    play: 'Imir',
    watchDemo: 'Féach ar Thaispeántas',
    demoMode: 'Mód Taispeántais',
    exitDemo: 'Éirigh as',
    watchAI: 'Féach ar an AI ag imirt ar an dá thaobh',
    tutorial: 'Teagasc',
    tutorialSteps: {
      king: { title: 'An Rí', description: 'Tosaíonn an píosa Rí órga sa lár. Is é do sprioc mar chosantóir an Rí a thionlacan go dtí aon chúinne chun bua.' },
      defender: { title: 'Cosantóirí', description: 'Cosnaíonn na píosaí geala an Rí. Is féidir leo ionsaitheoirí a ghabháil trí iad a fháisceadh idir dhá phíosa.' },
      attacker: { title: 'Ionsaitheoirí', description: 'Tosaíonn na píosaí dorcha ar na himill. Caithfidh siad an Rí a ghabháil trí é a thimpeallú ar gach ceithre thaobh.' },
      capture: { title: 'Gabháil', description: 'Gabh píosaí namhad trí iad a fháisceadh idir dhá cheann de do chuid (go cothrománach nó ingearach). Áirítear an ríchathaoir agus na cúinní mar chomhghuaillithe.' },
      victory: { title: 'Bua', description: 'Buaíonn cosantóirí nuair a shroicheann an Rí cúinne. Buaíonn ionsaitheoirí nuair atá an Rí timpeallaithe ar gach ceithre thaobh.' },
    },
    previous: 'Roimhe',
    next: 'Ar Aghaidh',
    skipTutorial: 'Scipeáil',
    rules: 'Rialacha',
    runeTitle: 'ᚺᚾᛖᚠᚨᛏᚨᚠᛚ — Rialacha Brandub',
    basics: 'Bunúsach',
    movement: 'Gluaiseacht',
    strategy: 'Straitéis',
    theSetup: 'An Socrú',
    setupDescription: 'Is cluiche straitéise ársa é Brandub ("Fiach Dubh"). Aghaidh beirt imreoirí ar a chéile i gcath neamhshiméadrach:',
    attackersDesc: 'Tosaigh ar na himill, níos mó ná cosantóirí 2:1',
    defendersDesc: 'Cosain an Rí sa lár',
    kingDesc: 'Caithfidh éalú go dtí aon chúinne',
    victoryConditions: 'Coinníollacha Bua',
    defendersWin: 'Sroicheann an Rí aon chúinne',
    attackersWin: 'Gabhtar an Rí (timpeallaithe ar gach 4 thaobh)',
    specialSquares: 'Cearnóga Speisialta',
    corners: 'Cúinní (ᛉ)',
    cornersDesc: 'Ní féidir ach leis an Rí dul isteach. Pointí éalaithe do chosantóirí.',
    throne: 'Ríchathaoir (ᚦ)',
    throneDesc: 'An cearnóg láir. Ní féidir ach leis an Rí é a áitiú tar éis fágáil.',
    howPiecesMove: 'Conas a Ghluaiseann Píosaí',
    movementDesc: 'Gluaiseann gach píosa ar an mbealach céanna: aon líon cearnóg go cothrománach nó go hingearach (cosúil le caiseal i bhficheall). Ní féidir le píosaí léim thar píosaí eile nó bogadh go trasnánach.',
    capturingPieces: 'Píosaí a Ghabháil',
    capturingDesc: 'Gabh namhaid trí é a fháisceadh idir dhá cheann de do phíosaí (gabháil choimeádta). Tarlaíonn an gabháil feadh ro nó colún, ní go trasnánach.',
    capturingKing: 'An Rí a Ghabháil',
    capturingKingDesc: 'Caithfear an Rí a thimpeallú ar gach ceithre thaobh chun é a ghabháil. Is féidir leis an ríchathaoir agus na cúinní gníomhú mar an ceathrú taobh má tá an Rí in aice láimhe.',
    defenderTips: 'Leideanna do Chosantóirí',
    defenderTipsDesc: 'Cruthaigh bealaí éalaithe iolracha don Rí. Cuir iallach ar ionsaitheoirí cúinní iolracha a chosaint ag an am céanna. Íobair píosaí go straitéiseach chun conairí a oscailt.',
    attackerTips: 'Leideanna do Ionsaitheoirí',
    attackerTipsDesc: 'Smachtaigh na himill agus na cúinní ar dtús. Cruthaigh líon thart ar an Rí. Bí foighneach agus déan an lúb a dhaingniú de réir a chéile.',
    variantRules: 'Rialacha Leagain',
    kingArmed: 'Rí Armtha',
    kingArmedDesc: 'Is féidir leis an Rí páirt a ghlacadh i ngabhálacha',
    edgeEscape: 'Éalú Imeall',
    edgeEscapeDesc: 'Is féidir leis an Rí éalú trí aon imeall, ní hamháin cúinní',
    shieldwallCapture: 'Gabháil Sciathbhalla',
    shieldwallCaptureDesc: 'Is féidir píosaí iolracha in aghaidh imeall a ghabháil ag an am céanna',
    currentTurn: 'Seal Reatha',
    yourTurn: 'Do sheal',
    aiThinking: 'AI ag smaoineamh...',
    youPlayAs: 'Imríonn tú mar',
    moveHistory: 'Stair Boganna',
    noMovesYet: 'Níl aon bhogadh fós',
    newGame: 'Cluiche Nua',
    undo: 'Cealaigh',
    victory: 'Bua!',
    defeat: 'Cloíte',
    youTriumphed: 'Bhuaigh tú!',
    youFallen: 'Thit tú.',
    areVictorious: 'bhuaigh.',
    haveClaimedVictory: 'd\'éiligh bua.',
    playAgain: 'Imir Arís',
    backToSetup: 'Ar Ais',
    spreadOfTafl: 'Scaipeadh Brandub',
    tradeRoutes: 'Bealaí Trádála Ársa',
    clickLocation: 'Cliceáil suíomh chun leagan a roghnú',
    origin: 'Bunús',
    era: 'Ré',
    history: 'Stair',
    kingAdvances: 'Téann an Rí chun cinn i dtreo cearnóg éalaithe.',
    kingRepositions: 'Athshuíonn an Rí chun deiseanna éalaithe a chruthú.',
    attackersSiege: 'Daingníonn ionsaitheoirí an léigear thart ar an Rí.',
    defendersManeuver: 'Déanann cosantóirí ionramháil chun an Rí a chosaint.',
    music: 'Ceol',
    sfx: 'Fuaim',
    startGame: 'Tosaigh Cluiche',
    languageName: 'Gaeilge',
    learnGame: 'Foghlaim an Cluiche',
    stepOf: 'Céim {current} de {total}',
    startPlaying: 'Tosaigh ag Imirt',
    viewTutorialAgain: 'Féach ar an Teagasc Arís',
    playAs: 'Imir Mar',
    protectKing: 'Cosain an Rí',
    captureKing: 'Gabh an Rí',
    attackersFirst: 'Ionsaitheoirí ar dtús.',
    youStart: 'Tosaíonn tú!',
    aiStarts: 'Tosaíonn an AI.',
    viewMap: 'Féach ar Léarscáil',
    fidchell: {
      navelStone: 'Cloch an Imleacáin',
      sacredWeb: 'An Gréasán Naofa',
      connectionVictory: 'Bua Ceangail',
      circularBoard: 'Clár Ciorclach',
      whiteConnects: 'Cruthaíonn bán cosán ón lár go dtí an imeall',
      blackBlocks: 'Blocálann dubh an ceangal',
      equalForces: 'Fórsaí Comhionanna',
      createPath: 'Cruthaigh slabhra gan bhriseadh go dtí an t-imeall amuigh',
      blockPath: 'Bac bán ó shroicheadh an t-imeall',
    },
  },
  
  gd: {
    appName: 'Tafl',
    tagline: 'Geama Àrsaidh na Ro-innleachd',
    subtitle: 'Geamannan Bùird Lochlannach & Ceilteach bhon t-Seann Shaoghal',
    selectVariant: 'Tagh Tionndadh',
    chooseSide: 'Tagh Do Thaobh',
    attacker: 'Ionnsaigheach',
    attackers: 'Luchd-ionnsaigh',
    defender: 'Dìonadair',
    defenders: 'Luchd-dìon',
    difficulty: 'Duilgheadas',
    beginner: 'Tòisiche',
    easy: 'Furasta',
    medium: 'Meadhanach',
    hard: 'Doirbh',
    valhalla: 'Valhalla',
    play: 'Cluich',
    watchDemo: 'Coimhead Demo',
    demoMode: 'Modh Demo',
    exitDemo: 'Fàg Demo',
    watchAI: 'Coimhead an AI a\' cluich gach taobh',
    tutorial: 'Oideachadh',
    tutorialSteps: {
      king: { title: 'An Rìgh', description: 'Tha am pìos Rìgh òir a\' tòiseachadh sa mheadhan. Is e do mhiann mar dhìonadair an Rìgh a threòrachadh gu oisean sam bith airson buannachadh.' },
      defender: { title: 'Luchd-dìon', description: 'Bidh pìosan soilleir a\' dìon an Rìgh. Is urrainn dhaibh luchd-ionnsaigh a ghlacadh le bhith gan teannachadh eadar dà phìos.' },
      attacker: { title: 'Luchd-ionnsaigh', description: 'Tha pìosan dorcha a\' tòiseachadh air na h-oirean. Feumaidh iad an Rìgh a ghlacadh le bhith ga chuartachadh air gach ceithir taobhan.' },
      capture: { title: 'Glacadh', description: 'Glac pìosan nàmhaid le bhith gan teannachadh eadar dhà dhiubh agad (gu còmhnard no gu h-inghearach). Bidh an rìgh-chathair agus na h-oisean a\' cunntadh mar charaidean.' },
      victory: { title: 'Buaidh', description: 'Bidh luchd-dìon a\' buannachadh nuair a ruigeas an Rìgh oisean. Bidh luchd-ionnsaigh a\' buannachadh nuair a tha an Rìgh cuartaichte air gach ceithir taobhan.' },
    },
    previous: 'Roimhe',
    next: 'Air Adhart',
    skipTutorial: 'Leum Seachad',
    rules: 'Riaghailtean',
    runeTitle: 'ᚺᚾᛖᚠᚨᛏᚨᚠᛚ — Riaghailtean Tawlbwrdd',
    basics: 'Bunaitean',
    movement: 'Gluasad',
    strategy: 'Ro-innleachd',
    theSetup: 'An Suidheachadh',
    setupDescription: 'Is e geama ro-innleachd àrsaidh a th\' ann an Tawlbwrdd. Tha dithis chluicheadairean a\' coinneachadh ann an cath neo-cho-ionann:',
    attackersDesc: 'Tòisich air na h-oirean, còrr air luchd-dìon 2:1',
    defendersDesc: 'Dìon an Rìgh sa mheadhan',
    kingDesc: 'Feumaidh teicheadh gu oisean sam bith',
    victoryConditions: 'Cumhaichean Buaidh',
    defendersWin: 'Ruigidh an Rìgh oisean sam bith',
    attackersWin: 'Tha an Rìgh air a ghlacadh (cuartaichte air 4 taobhan)',
    specialSquares: 'Ceàrnagan Sònraichte',
    corners: 'Oisean (ᛉ)',
    cornersDesc: 'Chan fhaod ach an Rìgh a dhol a-steach. Puingean teichidh do luchd-dìon.',
    throne: 'Rìgh-chathair (ᚦ)',
    throneDesc: 'An ceàrnag mheadhanach. Chan fhaod ach an Rìgh a bhith ann às dèidh fhàgail.',
    howPiecesMove: 'Mar a Ghluaiseas Pìosan',
    movementDesc: 'Gluaisidh a h-uile pìos san aon dòigh: àireamh sam bith de cheàrnagan gu còmhnard no gu h-inghearach (mar chaiseal ann an tàileasg). Chan urrainn do phìosan leum thairis air pìosan eile no gluasad gu trastanach.',
    capturingPieces: 'Pìosan a Ghlacadh',
    capturingDesc: 'Glac nàmhaid le bhith ga theannachadh eadar dà phìos agad (glacadh dìona). Tachairidh an glacadh ri sreath no colbh, chan ann gu trastanach.',
    capturingKing: 'An Rìgh a Ghlacadh',
    capturingKingDesc: 'Feumaidh an Rìgh a bhith cuartaichte air gach ceithir taobhan airson a ghlacadh. Is urrainn don rìgh-chathair agus na h-oisean a bhith mar an ceathramh taobh ma tha an Rìgh faisg.',
    defenderTips: 'Comhairle do Luchd-dìon',
    defenderTipsDesc: 'Cruthaich iomadh slighe teichidh don Rìgh. Sparr air luchd-ionnsaigh iomadh oisean a dhìon aig an aon àm. Ìobair pìosan gu ro-innleachdail airson slighean fhosgladh.',
    attackerTips: 'Comhairle do Luchd-ionnsaigh',
    attackerTipsDesc: 'Smachdaich na h-oirean agus na h-oisean an toiseach. Cruthaich lìon timcheall an Rìgh. Bi foighidneach agus teann an t-ìosail mean air mhean.',
    variantRules: 'Riaghailtean Tionndaidh',
    kingArmed: 'Rìgh Armaichte',
    kingArmedDesc: 'Is urrainn don Rìgh pàirt a ghabhail ann an glacaidhean',
    edgeEscape: 'Teicheadh Oir',
    edgeEscapeDesc: 'Is urrainn don Rìgh teicheadh tro oir sam bith, chan e dìreach oisean',
    shieldwallCapture: 'Glacadh Balla-sgiatha',
    shieldwallCaptureDesc: 'Is urrainn iomadh pìos an aghaidh oir a ghlacadh aig an aon àm',
    currentTurn: 'Cuairt Làithreach',
    yourTurn: 'Do chuairt',
    aiThinking: 'AI a\' smaoineachadh...',
    youPlayAs: 'Tha thu a\' cluich mar',
    moveHistory: 'Eachdraidh Ghluasadan',
    noMovesYet: 'Gun ghluasadan fhathast',
    newGame: 'Geama Ùr',
    undo: 'Neo-dhèan',
    victory: 'Buaidh!',
    defeat: 'Call',
    youTriumphed: 'Bhuannaich thu!',
    youFallen: 'Thuit thu.',
    areVictorious: 'bhuannaich.',
    haveClaimedVictory: 'ghlac buaidh.',
    playAgain: 'Cluich A-rithist',
    backToSetup: 'Air Ais',
    spreadOfTafl: 'Sgaoileadh Tawlbwrdd',
    tradeRoutes: 'Slighean Malairt Àrsaidh',
    clickLocation: 'Cliog air àite airson tionndadh a thaghadh',
    origin: 'Tùs',
    era: 'Linn',
    history: 'Eachdraidh',
    kingAdvances: 'Tha an Rìgh a\' gluasad gu ceàrnag teichidh.',
    kingRepositions: 'Tha an Rìgh ag ath-shuidheachadh airson cothroman teichidh.',
    attackersSiege: 'Tha luchd-ionnsaigh a\' daingneachadh an t-sèist timcheall an Rìgh.',
    defendersManeuver: 'Tha luchd-dìon a\' manaidsearachd airson an Rìgh a dhìon.',
    music: 'Ceòl',
    sfx: 'Fuaim',
    startGame: 'Tòisich Geama',
    languageName: 'Gàidhlig',
    learnGame: 'Ionnsaich an Geama',
    stepOf: 'Ceum {current} de {total}',
    startPlaying: 'Tòisich a\' Cluich',
    viewTutorialAgain: 'Faic an Oideachadh A-rithist',
    playAs: 'Cluich Mar',
    protectKing: 'Dìon an Rìgh',
    captureKing: 'Glac an Rìgh',
    attackersFirst: 'Luchd-ionnsaigh an toiseach.',
    youStart: 'Tha thu a\' tòiseachadh!',
    aiStarts: 'Tha an AI a\' tòiseachadh.',
    viewMap: 'Faic Mapa',
    fidchell: {
      navelStone: 'Clach an Imleig',
      sacredWeb: 'An Lìon Naomh',
      connectionVictory: 'Buaidh Ceangail',
      circularBoard: 'Bòrd Cruinn',
      whiteConnects: 'Bidh geal a\' cruthachadh slighe bhon mheadhan chun oir',
      blackBlocks: 'Bidh dubh a\' bacadh a\' cheangail',
      equalForces: 'Feachdan Co-ionann',
      createPath: 'Cruthaich slabhraidh gun bhriseadh chun oir a-muigh',
      blockPath: 'Bac geal bho ruigsinn an oir',
    },
  },
  
  cy: {
    appName: 'Tawlbwrdd',
    tagline: 'Gêm Hynafol Strategaeth',
    subtitle: 'Gemau Bwrdd Llychlynaidd a Cheltaidd o\'r Hen Fyd',
    selectVariant: 'Dewis Amrywiad',
    chooseSide: 'Dewis Eich Ochr',
    attacker: 'Ymosodwr',
    attackers: 'Ymosodwyr',
    defender: 'Amddiffynnwr',
    defenders: 'Amddiffynwyr',
    difficulty: 'Anhawster',
    beginner: 'Dechreuwr',
    easy: 'Hawdd',
    medium: 'Canolig',
    hard: 'Anodd',
    valhalla: 'Valhalla',
    play: 'Chwarae',
    watchDemo: 'Gwylio Demo',
    demoMode: 'Modd Demo',
    exitDemo: 'Gadael Demo',
    watchAI: 'Gwyliwch yr AI yn chwarae ddwy ochr',
    tutorial: 'Tiwtorial',
    tutorialSteps: {
      king: { title: 'Y Brenin', description: 'Mae\'r darn Brenin aur yn dechrau yn y canol. Eich nod fel amddiffynnwr yw hebrwng y Brenin i unrhyw gornel i ennill.' },
      defender: { title: 'Amddiffynwyr', description: 'Mae darnau golau yn amddiffyn y Brenin. Gallant ddal ymosodwyr trwy eu dal rhwng dau ddarn.' },
      attacker: { title: 'Ymosodwyr', description: 'Mae darnau tywyll yn dechrau ar yr ymylon. Rhaid iddynt ddal y Brenin trwy ei amgylchynu ar bob pedair ochr.' },
      capture: { title: 'Dal', description: 'Daliwch ddarnau gelyn trwy eu dal rhwng dau o\'ch rhai chi (yn llorweddol neu\'n fertigol). Mae\'r orsedd a\'r corneli yn cyfrif fel cynghreiriaid.' },
      victory: { title: 'Buddugoliaeth', description: 'Mae amddiffynwyr yn ennill pan fydd y Brenin yn cyrraedd cornel. Mae ymosodwyr yn ennill pan fydd y Brenin wedi\'i amgylchynu ar bob pedair ochr.' },
    },
    previous: 'Blaenorol',
    next: 'Nesaf',
    skipTutorial: 'Hepgor',
    rules: 'Rheolau',
    runeTitle: 'ᚺᚾᛖᚠᚨᛏᚨᚠᛚ — Rheolau Tawlbwrdd',
    basics: 'Hanfodion',
    movement: 'Symudiad',
    strategy: 'Strategaeth',
    theSetup: 'Y Gosodiad',
    setupDescription: 'Gêm strategaeth hynafol yw Tawlbwrdd ("bwrdd taflu"). Mae dau chwaraewr yn wynebu\'i gilydd mewn brwydr anghymesur:',
    attackersDesc: 'Dechrau ar yr ymylon, yn fwy na\'r amddiffynwyr 2:1',
    defendersDesc: 'Amddiffyn y Brenin yn y canol',
    kingDesc: 'Rhaid dianc i unrhyw gornel',
    victoryConditions: 'Amodau Buddugoliaeth',
    defendersWin: 'Mae\'r Brenin yn cyrraedd unrhyw gornel',
    attackersWin: 'Mae\'r Brenin yn cael ei ddal (wedi\'i amgylchynu ar 4 ochr)',
    specialSquares: 'Sgwariau Arbennig',
    corners: 'Corneli (ᛉ)',
    cornersDesc: 'Dim ond y Brenin sy\'n cael mynd i mewn. Pwyntiau dianc i amddiffynwyr.',
    throne: 'Gorsedd (ᚦ)',
    throneDesc: 'Y sgwâr canolog. Dim ond y Brenin sy\'n cael ei feddiannu ar ôl gadael.',
    howPiecesMove: 'Sut Mae Darnau\'n Symud',
    movementDesc: 'Mae pob darn yn symud yr un ffordd: unrhyw nifer o sgwariau yn llorweddol neu\'n fertigol (fel castell mewn gwyddbwyll). Ni all darnau neidio dros ddarnau eraill na symud yn groeslinol.',
    capturingPieces: 'Dal Darnau',
    capturingDesc: 'Daliwch elyn trwy ei ddal rhwng dau o\'ch darnau (dal gwarchodol). Mae\'r dal yn digwydd ar hyd rhes neu golofn, nid yn groeslinol.',
    capturingKing: 'Dal y Brenin',
    capturingKingDesc: 'Rhaid amgylchynu\'r Brenin ar bob pedair ochr i\'w ddal. Gall yr orsedd a\'r corneli weithredu fel y bedwaredd ochr os yw\'r Brenin yn gyfagos.',
    defenderTips: 'Awgrymiadau i Amddiffynwyr',
    defenderTipsDesc: 'Crëwch sawl llwybr dianc i\'r Brenin. Gorfodwch ymosodwyr i amddiffyn sawl cornel ar unwaith. Aberthwch ddarnau\'n strategol i agor llwybrau.',
    attackerTips: 'Awgrymiadau i Ymosodwyr',
    attackerTipsDesc: 'Rheolwch yr ymylon a\'r corneli yn gyntaf. Crëwch rwyd o amgylch y Brenin. Byddwch yn amyneddgar a thynhewch y magl yn raddol.',
    variantRules: 'Rheolau Amrywiad',
    kingArmed: 'Brenin Arfog',
    kingArmedDesc: 'Gall y Brenin gymryd rhan mewn daliadau',
    edgeEscape: 'Dianc Ymyl',
    edgeEscapeDesc: 'Gall y Brenin ddianc trwy unrhyw ymyl, nid dim ond corneli',
    shieldwallCapture: 'Dal Wal Darian',
    shieldwallCaptureDesc: 'Gellir dal sawl darn yn erbyn ymyl ar unwaith',
    currentTurn: 'Tro Presennol',
    yourTurn: 'Eich tro',
    aiThinking: 'AI yn meddwl...',
    youPlayAs: 'Rydych yn chwarae fel',
    moveHistory: 'Hanes Symudiadau',
    noMovesYet: 'Dim symudiadau eto',
    newGame: 'Gêm Newydd',
    undo: 'Dadwneud',
    victory: 'Buddugoliaeth!',
    defeat: 'Trechu',
    youTriumphed: 'Rydych wedi gorchfygu!',
    youFallen: 'Rydych wedi cwympo.',
    areVictorious: 'yn fuddugol.',
    haveClaimedVictory: 'wedi hawlio buddugoliaeth.',
    playAgain: 'Chwarae Eto',
    backToSetup: 'Yn Ôl',
    spreadOfTafl: 'Lledaeniad Tawlbwrdd',
    tradeRoutes: 'Llwybrau Masnach Hynafol',
    clickLocation: 'Cliciwch leoliad i ddewis amrywiad',
    origin: 'Tarddiad',
    era: 'Cyfnod',
    history: 'Hanes',
    kingAdvances: 'Mae\'r Brenin yn symud tuag at sgwâr dianc.',
    kingRepositions: 'Mae\'r Brenin yn ail-leoli i greu cyfleoedd dianc.',
    attackersSiege: 'Mae ymosodwyr yn tynhau\'r gwarchae o amgylch y Brenin.',
    defendersManeuver: 'Mae amddiffynwyr yn symud i amddiffyn y Brenin.',
    music: 'Cerddoriaeth',
    sfx: 'Sain',
    startGame: 'Dechrau Gêm',
    languageName: 'Cymraeg',
    learnGame: 'Dysgwch y Gêm',
    stepOf: 'Cam {current} o {total}',
    startPlaying: 'Dechrau Chwarae',
    viewTutorialAgain: 'Gweld y Tiwtorial Eto',
    playAs: 'Chwarae Fel',
    protectKing: 'Amddiffyn y Brenin',
    captureKing: 'Dal y Brenin',
    attackersFirst: 'Ymosodwyr yn gyntaf.',
    youStart: 'Chi\'n dechrau!',
    aiStarts: 'AI yn dechrau.',
    viewMap: 'Gweld Map',
    fidchell: {
      navelStone: 'Carreg y Bogail',
      sacredWeb: 'Y We Sanctaidd',
      connectionVictory: 'Buddugoliaeth Cysylltiad',
      circularBoard: 'Bwrdd Crwn',
      whiteConnects: 'Mae gwyn yn creu llwybr o\'r canol i\'r ymyl',
      blackBlocks: 'Mae du yn blocio\'r cysylltiad',
      equalForces: 'Lluoedd Cyfartal',
      createPath: 'Crëwch gadwyn ddi-dor i\'r ymyl allanol',
      blockPath: 'Rhwystrwch wyn rhag cyrraedd yr ymyl',
    },
  },
  
  ang: {
    appName: 'Tæfl',
    tagline: 'Þæt Ealde Tæflspel',
    subtitle: 'Norþmanna & Wēala Tæflspelas fram Ealddagum',
    selectVariant: 'Cēos Cynren',
    chooseSide: 'Cēos Þīne Sīdan',
    attacker: 'Onwinnend',
    attackers: 'Onwinnendas',
    defender: 'Werigend',
    defenders: 'Werigendas',
    difficulty: 'Earfoþnes',
    beginner: 'Leorningcniht',
    easy: 'Ēaþe',
    medium: 'Middel',
    hard: 'Heard',
    valhalla: 'Wælheall',
    play: 'Plega',
    watchDemo: 'Gesēoh Bȳsen',
    demoMode: 'Bȳsen-Wīse',
    exitDemo: 'Forlet Bȳsen',
    watchAI: 'Gesēoh þone cræftigan plegian bēgen sīdan',
    tutorial: 'Lāreow',
    tutorialSteps: {
      king: { title: 'Se Cyning', description: 'Se gyldena cyningtæfl onginneþ on middan. Þīn willa swā werigend is þone cyning tō ǣlcum hyrnan gelǣdan tō sigore.' },
      defender: { title: 'Werigendas', description: 'Lēohte tæflas werigaþ þone cyning. Hīe magon onwinnendas gehabban mid hīe betwēonan twǣm tæflum fōn.' },
      attacker: { title: 'Onwinnendas', description: 'Deorce tæflas onginnaþ on þǣm ecgum. Hīe sculon þone cyning gehabban mid hine on eallum fēower sīdum ymbsellan.' },
      capture: { title: 'Gefōn', description: 'Hafa fēondas betwēonan twǣm þīnum (efenriht oþþe upriht). Sē cyninges setl and þā hyrnan tellað swā gefēran.' },
      victory: { title: 'Sige', description: 'Werigendas winnaþ þonne se cyning hyrnan gerǣcþ. Onwinnendas winnaþ þonne se cyning is on eallum fēower sīdum ymbseted.' },
    },
    previous: 'Ǣror',
    next: 'Æfter',
    skipTutorial: 'Oferhlēap',
    rules: 'Regolas',
    runeTitle: 'ᚺᚾᛖᚠᚨᛏᚨᚠᛚ — Hnefatafl Regolas',
    basics: 'Grundas',
    movement: 'Styrung',
    strategy: 'Cræft',
    theSetup: 'Sēo Setlung',
    setupDescription: 'Hnefatafl ("Cyninges Bord") is eald tæflspel. Twēgen pleogan on ungelic gefeohte:',
    attackersDesc: 'Onginnaþ on ecgum, māran þonne werigendas 2:1',
    defendersDesc: 'Werigaþ þone cyning on middan',
    kingDesc: 'Mōt tō ǣlcum hyrnan flēon',
    victoryConditions: 'Sigerǣdas',
    defendersWin: 'Se cyning gerǣcþ ǣlcne hyrnan',
    attackersWin: 'Se cyning is gefangen (ymbseted on 4 sīdum)',
    specialSquares: 'Syndrige Feldas',
    corners: 'Hyrnan (ᛉ)',
    cornersDesc: 'Āna se cyning mæg ingān. Flēamstōwa for werigendum.',
    throne: 'Cyninges Setl (ᚦ)',
    throneDesc: 'Sēo middelfeld. Āna se cyning mæg hīe sittan æfter forlete.',
    howPiecesMove: 'Hū Tæflas Styraþ',
    movementDesc: 'Ealle tæflas styraþ gelīce: ǣnig numer felda efenriht oþþe upriht (swā hræcca on scæce). Tæflas ne magon ofer ōþre hlēapan ne scīfriht styran.',
    capturingPieces: 'Tæflas Gefōn',
    capturingDesc: 'Hafa fēond mid hine betwēonan twǣm þīnum tæflum. Gefōn gebyreþ on rǣwe oþþe stæpe, nā scīfriht.',
    capturingKing: 'Þone Cyning Gefōn',
    capturingKingDesc: 'Se cyning mōt bēon ymbseted on eallum fēower sīdum tō gefōnne. Þæt cyninges setl and þā hyrnan magon bēon swā fēorþa sīde gif se cyning is nēah.',
    defenderTips: 'Rǣd for Werigendum',
    defenderTipsDesc: 'Wyrce mænige flēamwegas for þǣm cyninge. Nīed onwinnendas tō mænige hyrnan werian æt ǣne. Onsecge tæflas cræftlīce tō wegas openienne.',
    attackerTips: 'Rǣd for Onwinnendum',
    attackerTipsDesc: 'Gewealde þā ecgas and hyrnan ǣrest. Wyrce nett ymbe þone cyning. Bēo geþyldig and tēoh þone grīn smēaglīce.',
    variantRules: 'Cynren Regolas',
    kingArmed: 'Gewǣpnod Cyning',
    kingArmedDesc: 'Se cyning mæg dǣl niman on gefōnne',
    edgeEscape: 'Ecgflēam',
    edgeEscapeDesc: 'Se cyning mæg flēon þurh ǣlce ecge, nā āna hyrnan',
    shieldwallCapture: 'Scieldweallgefōn',
    shieldwallCaptureDesc: 'Mænige tæflas wið ecge magon bēon gefangen æt ǣne',
    currentTurn: 'Andweard Hwīl',
    yourTurn: 'Þīn hwīl',
    aiThinking: 'Cræftiga þenceþ...',
    youPlayAs: 'Þū plegast swā',
    moveHistory: 'Styrunggewrit',
    noMovesYet: 'Nān styrung gīet',
    newGame: 'Nīwe Spel',
    undo: 'Onwendan',
    victory: 'Sige!',
    defeat: 'Hryre',
    youTriumphed: 'Þū oferswīðdest!',
    youFallen: 'Þū fēollest.',
    areVictorious: 'sigeþ.',
    haveClaimedVictory: 'habbað sige genumen.',
    playAgain: 'Plega Eft',
    backToSetup: 'Onbæc',
    spreadOfTafl: 'Hnefatafles Tōsprǣding',
    tradeRoutes: 'Ealde Cēapwegas',
    clickLocation: 'Clic stōwe tō cynren cēosan',
    origin: 'Fruma',
    era: 'Tīd',
    history: 'Wyrd',
    kingAdvances: 'Se cyning forþstæpþ tō flēamfelde.',
    kingRepositions: 'Se cyning hine gesetþ tō flēamrum wyrcanne.',
    attackersSiege: 'Onwinnendas þicgaþ þā ymbsetnesse ymbe þone cyning.',
    defendersManeuver: 'Werigendas hyldaþ tō þone cyning werian.',
    music: 'Drēam',
    sfx: 'Swēg',
    startGame: 'Ongin Spel',
    languageName: 'Eald Englisc',
    learnGame: 'Leorna þæt Spel',
    stepOf: 'Stæpe {current} of {total}',
    startPlaying: 'Ongin Plegan',
    viewTutorialAgain: 'Gesēoh Lāreow Eft',
    playAs: 'Plega Swā',
    protectKing: 'Weriga þone Cyning',
    captureKing: 'Gefōh þone Cyning',
    attackersFirst: 'Onwinnendas ǣrest.',
    youStart: 'Þū onginnest!',
    aiStarts: 'Cræftiga onginneþ.',
    viewMap: 'Gesēoh Mapan',
    fidchell: {
      navelStone: 'Nafolan Stān',
      sacredWeb: 'Þæt Hālige Webb',
      connectionVictory: 'Gefēgsige',
      circularBoard: 'Hringbord',
      whiteConnects: 'Hwīt wyrcþ pæþ fram middan tō ecge',
      blackBlocks: 'Sweart forwyrnþ þone gefēg',
      equalForces: 'Efenwerod',
      createPath: 'Wyrce ungebrocen rǣw tō ūterran ecge',
      blockPath: 'Forwyrne hwīt fram ecge geræcanne',
    },
  },
};

export const languageFlags: Record<Language, { flag: string; name: string }> = {
  en: { flag: '🇬🇧', name: 'English' },
  swe: { flag: '🇸🇪', name: 'Svenska' },
  ga: { flag: '🇮🇪', name: 'Gaeilge' },
  gd: { flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name: 'Gàidhlig' },
  cy: { flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', name: 'Cymraeg' },
  ang: { flag: '⚔️', name: 'Eald Englisc' },
};
