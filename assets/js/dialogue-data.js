// ---------------------------------------------------------------
// dialogue-data.js: who is in the scene and what they say.
// Edit this file to change the conversation. The engine lives in main.js.
// ---------------------------------------------------------------

// ---------------------------------------------------------------
// EXPRESSION GRID
// Both sheets are 4 cols x 3 rows. Each expression name maps to
// its [row, col] on the sheet. If a sheet uses a different order,
// give that character its own "expressions" map in CAST below.
// ---------------------------------------------------------------
const EXPRESSION_GRID = {
  Neutral:     [0,0], Thoughtful: [0,1], Stressed:   [0,2], Confident:   [0,3],
  Angry:       [1,0], Alarmed:    [1,1], Sorrowful:  [1,2], Overwhelmed: [1,3],
  Startled:    [2,0], Joyful:     [2,1], Weary:      [2,2], Suspicious:  [2,3]
};

// ---------------------------------------------------------------
// CAST
// side:  which side of the dialogue box the portrait sits on
// flip:  set true to mirror the sprite so the characters face each other
// sheet.src: path relative to index.html
// ---------------------------------------------------------------
const CAST = {
  matty: {
    name:  "Matty",
    side:  "left",
    flip:  false,
    sheet: {
      src:  "assets/images/matty-expression-sheet.png",
      cols: 4, rows: 3,
      expressions: EXPRESSION_GRID
    }
  },
  jules: {
    name:  "Jules",
    side:  "right",
    flip:  false,
    sheet: {
      src:  "assets/images/jules-expression-sheet.png",
      cols: 4, rows: 3,
      expressions: EXPRESSION_GRID
    }
  }
};

// ---------------------------------------------------------------
// SCRIPT
// speaker: who is talking (their portrait and name tag show)
// matty / jules: expression for that character on this line.
//   Leave one out and that character keeps their previous expression.
// ---------------------------------------------------------------
const SCRIPT = [
  { speaker:"matty", matty:"Suspicious",
    text:"Okay, artist extraordinaire, confession time. How many hours did you spend trying to get that protagonist's sad-to-surprised transition to actually look right?" },
  { speaker:"jules", jules:"Weary",
    text:"Three. Three agonizing hours, Matty. Every time I tweak the eyebrows, the jawline collapses. I'm starting to think characters shouldn't have feelings." },
  { speaker:"matty", matty:"Confident",
    text:"Good news: you don't have to suffer anymore. Look what I just found." },
  { speaker:"jules", jules:"Startled",
    text:"Wait, what is this? A Character Expression Template Kit?" },
  { speaker:"matty", matty:"Joyful",
    text:"Yep! It's got two clean, minimalist base figures with 24 distinct emotional states each. Plus, you get 4 high-res expression sheets in a tidy 3-row, 4-column grid (clocking in at 1740x2046 px total), and a Figma file so you can mess with the background colors and layout however you want." },
  { speaker:"jules", jules:"Startled",
    text:"No way... Is this for tracing and drawing over to build final sprites?" },
  { speaker:"matty", matty:"Confident",
    text:"Exactly. You can use it as a foundation for your art direction, or just drop the minimalist line art right into your game engine to prototype dialogue systems instantly." },
  { speaker:"jules", jules:"Joyful",
    text:"That saves me days of sketching! How much do we owe for it? Is it like, a whole subscription thing?" },
  { speaker:"matty", matty:"Joyful",
    text:"Nope! It's 100% free." },
  { speaker:"jules", jules:"Suspicious",
    text:"Free?! Stop joking. Where's the catch?" },
  { speaker:"matty", matty:"Confident",
    text:"No catch at all. The link is right above — go grab it before I claim it for my own projects!" }
];
