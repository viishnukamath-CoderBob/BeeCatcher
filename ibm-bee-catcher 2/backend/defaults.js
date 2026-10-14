// Default event configuration. Everything here is editable from the Admin panel
// (stored in data/db.json once the server runs for the first time).

module.exports = {
  eventName: 'IBM Bee Catcher',
  tagline: 'Catch the bee. Learn what IBM can do. Win IBM swag.',
  gameDuration: 60, // seconds (each level-up adds a time bonus)

  // Tiers are matched by the highest minScore <= player score.
  // Rough guide: ~2k = clear level 3, ~5k = level 5, ~11k = level 8, ~18k = clear all 10 levels.
  tiers: [
    {
      id: 'larva',
      name: 'Buzzing Beginner',
      minScore: 0,
      color: '#a8a8a8',
      prize: 'IBM sticker pack',
      stock: null,
      blurb: 'Every hive starts somewhere. Great first flight!',
    },
    {
      id: 'worker',
      name: 'Worker Bee',
      minScore: 2000,
      color: '#78a9ff',
      prize: 'IBM pen + notebook',
      stock: null,
      blurb: 'Steady, reliable and productive. You would fit right in on a delivery team.',
    },
    {
      id: 'pollinator',
      name: 'Pollinator',
      minScore: 5000,
      color: '#42be65',
      prize: 'IBM insulated bottle',
      stock: null,
      blurb: 'You spread good ideas everywhere you go. Sharp reflexes!',
    },
    {
      id: 'hivemaster',
      name: 'Hive Master',
      minScore: 11000,
      color: '#be95ff',
      prize: 'IBM premium tote + power bank',
      stock: null,
      blurb: 'You run a tight hive. Elite reflexes and a very tidy hive.',
    },
    {
      id: 'queen',
      name: 'Queen Bee',
      minScore: 18000,
      color: '#f1c21b',
      prize: 'IBM grand prize hamper',
      stock: null,
      blurb: 'Absolute legend. The whole hive bows to you.',
    },
  ],

  content: {
    facts: [
      {
        title: 'watsonx',
        text: 'IBM watsonx is IBM\'s AI and data platform built for business. It brings together watsonx.ai, watsonx.data and watsonx.governance.',
      },
      {
        title: 'Hybrid cloud',
        text: 'Red Hat OpenShift lets teams build once and run anywhere: on-premises, on any public cloud, or at the edge. IBM acquired Red Hat in 2019.',
      },
      {
        title: 'Quantum',
        text: 'IBM put a real quantum computer on the cloud in 2016. Anyone can run quantum circuits through IBM Quantum.',
      },
      {
        title: 'IBM Z',
        text: 'IBM Z mainframes power mission-critical workloads for banks, airlines and retailers, with extreme security and uptime.',
      },
      {
        title: 'Security',
        text: 'Every year IBM publishes the Cost of a Data Breach Report, an industry benchmark for understanding security risk.',
      },
      {
        title: 'Observability',
        text: 'IBM Instana gives real-time, automatic observability of applications so teams can find and fix issues fast.',
      },
      {
        title: 'Automation',
        text: 'IBM Turbonomic continuously automates resource decisions so apps keep performing while cloud costs go down.',
      },
      {
        title: 'Open AI models',
        text: 'IBM Granite is a family of open, enterprise-ready foundation models available in watsonx.',
      },
      {
        title: 'IBM Research',
        text: 'The hard disk drive, DRAM and the scanning tunneling microscope all came from IBM labs.',
      },
      {
        title: 'Our bee',
        text: 'The bee comes from the famous 1981 "Eye-Bee-M" poster designed by Paul Rand.',
      },
      {
        title: 'Consulting',
        text: 'IBM Consulting combines deep industry expertise with technology to help clients modernize and put AI to work.',
      },
    ],
  },
};
