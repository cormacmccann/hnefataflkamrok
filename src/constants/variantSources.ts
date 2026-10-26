import { VariantSource, AlternateRuleset } from '@/types/game';

// Primary historical sources for each tafl variant.
// Curated from peer-reviewed archaeology, surviving manuscripts, and saga literature.

export const VARIANT_SOURCES: Record<string, VariantSource[]> = {
  fidchell: [
    {
      title: 'The Ballinderry Crannog Game-Board',
      author: 'Hugh O\'Neill Hencken',
      year: '1933',
      type: 'archaeology',
      note: 'Excavation publication for the square Ballinderry peg-board, Co. Westmeath. It does not establish the modern circular Fidchell rules.',
      url: 'https://www.jstor.org/stable/25515912',
    },
    {
      title: 'Tochmarc Étaíne (The Wooing of Étaín)',
      year: 'c. 9th c.',
      type: 'saga',
      note: 'Medieval Irish tale featuring fidchell play between Midir and Eochaid; the complete rules are not given.',
      url: 'https://celt.ucc.ie/document/G300012/',
    },
    {
      title: 'The Mabinogion — Breuddwyd Rhonabwy',
      year: 'c. 12th–13th c.',
      type: 'saga',
      note: 'Welsh cognate "gwyddbwyll" (wood-sense) played by Arthur and Owain.',
    },
    {
      title: 'Games and Gaming Equipment of Pre-Norman Ireland',
      author: 'Eóin Mac White',
      year: '1945',
      type: 'scholarship',
      note: 'Journal of the Royal Society of Antiquaries of Ireland.',
    },
    {
      title: 'Fidchell — Origins & Classical Two-Player Rules',
      author: 'Unicorn Garden',
      type: 'scholarship',
      url: 'https://www.unicorngarden.com/fidchell/origins.htm',
      note: 'Argues fidchell was classically a two-player tafl-like game (king + defenders vs. attackers), distinct from later 3-player reconstructions.',
    },

  ],
  brandub: [
    {
      title: 'The Knowth Game Board',
      author: 'George Eogan',
      year: '1968',
      type: 'archaeology',
      note: 'Stone 7×7 board fragment from passage tomb, Co. Meath.',
    },
    {
      title: 'Abair riom a Eogain ḟinn (Poem on Brandub)',
      year: 'c. 10th c.',
      type: 'saga',
      note: 'Middle Irish poem listing the High King\'s "branán" (chief raven) and twelve men.',
    },
    {
      title: 'Tafl: Compendium of Reconstructed Rules',
      author: 'Damian Walker',
      year: '2014',
      type: 'scholarship',
      url: 'https://tafl.cyningstan.com/',
    },
  ],
  tablut: [
    {
      title: 'Iter Lapponicum (Lapland Journey)',
      author: 'Carl Linnaeus',
      year: '1732',
      type: 'manuscript',
      note: 'Diary entry of 18 July 1732 — the only complete historical ruleset for any tafl game, observed among the Sámi.',
      url: 'https://linnean-online.org/120010/',
    },
    {
      title: 'Hnefatafl — the Strategic Board Game of the Vikings',
      author: 'Sten Helmfrid',
      year: '2005',
      type: 'scholarship',
      url: 'http://hem.bredband.net/b512479/',
      note: 'Re-translates Linnaeus from Latin and reconstructs corrected rules.',
    },
  ],
  tawlbwrdd: [
    {
      title: 'Robert ap Ifan Manuscript',
      author: 'Robert ap Ifan',
      year: '1587',
      type: 'manuscript',
      note: 'A surviving Welsh description and diagram; modern playable reconstructions differ in details.',
      url: 'https://archives.library.wales/index.php/llyfr-robert-ap-ifan-o-fryn-siencyn?sf_culture=en',
    },
    {
      title: 'Cyfraith Hywel Dda (Laws of Hywel the Good)',
      year: 'c. 10th c., 13th-c. copies',
      type: 'manuscript',
      note: 'Welsh law codes listing tawlbwrdd among the "24 feats" required of a nobleman.',
    },
  ],
  hnefatafl: [
    {
      title: 'The Gokstad Ship Burial',
      author: 'Nicolay Nicolaysen',
      year: '1882',
      type: 'archaeology',
      note: 'Excavated 1880, Vestfold, Norway. Included a wooden gaming board and pieces dated c. 900 CE.',
    },
    {
      title: 'Friðþjófs saga ins frœkna',
      year: 'c. 14th c.',
      type: 'saga',
      note: 'Old Norse saga featuring a coded conversation conducted over a game of hnefatafl.',
    },
    {
      title: 'Birka Grave Bj 581',
      author: 'Hjalmar Stolpe',
      year: '1889',
      type: 'archaeology',
      note: 'Female warrior burial containing a hnefatafl set; re-analysed by Hedenstierna-Jonson et al. (2017).',
    },
  ],
  alea: [
    {
      title: 'Corpus Christi College, Oxford, MS 122',
      year: '1140–1199',
      type: 'manuscript',
      note: 'The Corpus Irish Gospels; game diagram on folio 5v and explanation on folio 6. Place of origin uncertain.',
      url: 'https://www.ccc.ox.ac.uk/corpus-manuscripts',
    },
    {
      title: 'Alea Evangelii: The Game of the Gospels',
      author: 'J. Armitage Robinson',
      year: '1923',
      type: 'scholarship',
      note: 'An early modern scholarly discussion of the manuscript and game diagram.',
    },
  ],
};

// Playable modern reconstructions. Archaeological boards attest games, not these complete rules.
export const VARIANT_ALTERNATES: Record<string, AlternateRuleset[]> = {
  tablut: [{
    name: 'Linnaeus / corrected translation',
    scholar: 'Linnaeus 1732; Salmi translation 2013',
    rules: { kingArmed: true, edgeEscape: true, shieldwallCapture: false, victoryType: 'escape' },
    attestation: 'Armed king, escape to an edge, two-sided capture away from the throne, three beside it and four on it. A modern playable reading of the surviving text.',
  }],
  hnefatafl: [{
    name: 'Copenhagen core',
    scholar: 'Nielsen, Bartley and Millar, 2012',
    rules: { kingArmed: true, edgeEscape: false, shieldwallCapture: true, victoryType: 'escape' },
    attestation: 'Armed king, corner escape, four-sided king capture and shieldwalls. This app automates captures, encirclement, immobilisation and threefold repetition; exit-fort claims and agreed draws are not adjudicated.',
  }],
  tawlbwrdd: [{
    name: 'Modern historical reconstruction',
    scholar: 'Aage Nielsen / Adam Bartley',
    rules: { kingArmed: true, edgeEscape: true, shieldwallCapture: false, victoryType: 'escape' },
    attestation: '11×11, 24 attackers, 12 defenders and an armed king. Edge escape and a king vulnerable to two-sided capture away from the throne.',
  }],
  brandub: [{
    name: 'Modern Brandubh',
    scholar: 'World Tafl Federation',
    rules: { kingArmed: true, edgeEscape: false, shieldwallCapture: false, victoryType: 'escape' },
    attestation: 'Armed king and corner escape. Four attackers capture the king on his throne; elsewhere he is captured between two hostile sides. The empty throne is not hostile to the king.',
  }],
  alea: [{
    name: 'Modern playable interpretation',
    scholar: 'TAFL house reconstruction',
    rules: { kingArmed: true, edgeEscape: true, shieldwallCapture: false, victoryType: 'escape' },
    attestation: 'The manuscript does not preserve a complete playable ruleset. This app uses an adapted 19×19 position with the armed-king, edge-escape mechanics of the historical tafl reconstruction.',
  }],
  fidchell: [{
    name: 'Modern connection interpretation',
    scholar: 'Modern game design',
    rules: { kingArmed: true, edgeEscape: false, shieldwallCapture: false, victoryType: 'connection' },
    attestation: 'The original rules of fidchell are lost. This circular connection game is a modern interpretation; the excavated Ballinderry board is square and does not establish this radial layout or connection mechanic.',
  }],
};

VARIANT_SOURCES.tablut.push({
  title: 'Translations of Linnaeus’s Tablut rules', author: 'Olli Salmi and Aage Nielsen', year: '2013', type: 'scholarship',
  url: 'https://aagenielsen.dk/tablut_translations.php', note: 'Comparison of the Latin text and modern translations; armed king and edge escape.',
});
VARIANT_SOURCES.brandub.push({
  title: 'World Tafl Federation Brandubh rules', type: 'scholarship',
  url: 'https://aagenielsen.dk/brandubh2_rules_en.pdf', note: 'Modern playable Brandubh rules used for the core king and capture mechanics.',
});
VARIANT_SOURCES.hnefatafl.push({
  title: 'Copenhagen Hnefatafl rules', author: 'Aage Nielsen, Adam Bartley and Tim Millar', year: '2012', type: 'scholarship',
  url: 'https://aagenielsen.dk/copenhagen_rules.php', note: 'Modern tournament rules; this app implements the core, with exit-fort claims and agreed draws not adjudicated.',
});
VARIANT_SOURCES.tawlbwrdd.push({
  title: 'Historical Hnefatafl rules', author: 'Aage Nielsen and Adam Bartley', type: 'scholarship',
  url: 'https://aagenielsen.dk/historical_hnefatafl_rules.php', note: 'Modern reconstruction with an armed king, edge escape and throne-dependent king capture.',
});

VARIANT_SOURCES.fidchell.push({
  title: 'The Ballinderry gaming board', author: 'National Museum of Ireland', type: 'archaeology',
  url: 'https://source.museum.ie/en-IE/Collections-Research/Irish-Antiquities-Division-Collections/Collections-List-%281%29/Viking/The-Ballinderry-gaming-board',
  note: 'Yew gaming board, forty-nine peg holes, excavated in 1932 at Ballinderry, Co. Westmeath. Associated with hnefatafl; not evidence for the circular connection layout.',
});
VARIANT_SOURCES.brandub.push({
  title: 'The Ballinderry gaming board', author: 'National Museum of Ireland', type: 'archaeology',
  url: 'https://source.museum.ie/en-IE/Collections-Research/Irish-Antiquities-Division-Collections/Collections-List-%281%29/Viking/The-Ballinderry-gaming-board',
  note: 'Yew gaming board, forty-nine peg holes, excavated in 1932 at Ballinderry, Co. Westmeath. Associated with hnefatafl; not evidence for the circular connection layout.',
});
