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
      note: '10th-century wooden 7×7 peg-board from Co. Offaly. Royal Irish Academy Proceedings, vol. 43.',
      url: 'https://www.jstor.org/stable/25515912',
    },
    {
      title: 'Tochmarc Étaíne (The Wooing of Étaín)',
      year: 'c. 9th c.',
      type: 'saga',
      note: 'Mid-Irish tale in the Yellow Book of Lecan describing Midir winning Étaín at fidchell.',
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
      note: 'Welsh manuscript with diagram showing 11×11 tawlbwrdd with 8 defenders, 16 attackers, armed king.',
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
      title: 'L\'Anse aux Meadows Gaming Piece',
      author: 'Anne Stine Ingstad',
      year: '1960s',
      type: 'archaeology',
      note: 'Bone gaming piece from the Norse site in Newfoundland — the game travelled with the Vikings to North America.',
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
      title: 'Corpus Christi College Cambridge MS 122',
      year: 'c. 1140 CE',
      type: 'manuscript',
      note: 'The sole surviving witness. Folios 5v–6r contain the 19×19 diagram and a Christological exegesis.',
      url: 'https://parker.stanford.edu/parker/catalog/jb957tn4513',
    },
    {
      title: 'Alea Evangelii: The Game of the Gospels',
      author: 'J. Armitage Robinson',
      year: '1923',
      type: 'scholarship',
      note: 'First modern transcription and translation; attributes the layout to Bishop Israel the Grammarian (10th c.).',
    },
  ],
};

// Alternate scholarly reconstructions for "Historian Mode"
export const VARIANT_ALTERNATES: Record<string, AlternateRuleset[]> = {
  tablut: [
    {
      name: 'Linnaeus literal',
      scholar: 'Linnaeus 1732 (literal Latin)',
      rules: { kingArmed: false, edgeEscape: false, shieldwallCapture: false, victoryType: 'escape' },
      attestation: 'King escapes only to corner squares; attackers win on capture or stalemate.',
    },
    {
      name: 'Helmfrid reconstruction',
      scholar: 'Sten Helmfrid 2005',
      rules: { kingArmed: false, edgeEscape: true, shieldwallCapture: false, victoryType: 'escape' },
      attestation: 'Re-reads Linnaeus to allow escape to any edge square — closer to historical Sámi play.',
    },
  ],
  hnefatafl: [
    {
      name: 'Copenhagen rules',
      scholar: 'Aage Nielsen, modern tournament',
      rules: { kingArmed: false, edgeEscape: false, shieldwallCapture: true, victoryType: 'escape' },
      attestation: 'Most-played modern ruleset. King unarmed, corner escape, shieldwall captures legal.',
    },
    {
      name: 'Fetlar rules',
      scholar: 'Shetland Hnefatafl Festival',
      rules: { kingArmed: true, edgeEscape: false, shieldwallCapture: true, victoryType: 'escape' },
      attestation: 'Armed king variant used at the annual Fetlar tournament since 2008.',
    },
  ],
  tawlbwrdd: [
    {
      name: 'Robert ap Ifan literal',
      scholar: 'MS 1587, Bell 1979 transcription',
      rules: { kingArmed: true, edgeEscape: false, shieldwallCapture: false, victoryType: 'escape' },
      attestation: 'Manuscript explicitly shows 8 vs 16 with armed king escaping to corners.',
    },
  ],
  brandub: [
    {
      name: 'Walker reconstruction',
      scholar: 'Damian Walker 2014',
      rules: { kingArmed: true, edgeEscape: false, shieldwallCapture: false, victoryType: 'escape' },
      attestation: 'Standard 7×7 reconstruction matching the Ballinderry peg pattern.',
    },
  ],
  alea: [
    {
      name: 'CCCC MS 122 literal',
      scholar: 'Robinson 1923',
      rules: { kingArmed: false, edgeEscape: true, shieldwallCapture: false, victoryType: 'escape' },
      attestation: 'Manuscript implies edge escape on the 19×19 board.',
    },
  ],
  fidchell: [
    {
      name: 'Connection reconstruction (current default)',
      scholar: 'Modern (Ballinderry peg-pattern derived)',
      rules: { kingArmed: true, edgeEscape: false, shieldwallCapture: false, victoryType: 'connection' },
      attestation: 'Historical rules are lost; connection mechanic is a scholarly hypothesis based on the radial peg pattern.',
    },
    {
      name: 'Classical two-player tafl (Unicorn Garden)',
      scholar: 'Unicorn Garden (popular reconstruction)',
      rules: { kingArmed: true, edgeEscape: false, shieldwallCapture: false, victoryType: 'escape' },
      attestation: 'Treats fidchell as a two-player king-and-defenders vs. attackers game in the tafl family — the king escapes to a corner, captured by custodial flanking. The 3-player "Suckling" PDF ruleset is itself a later variant.',
    },
  ],

};
