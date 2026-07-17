export const TRUTH_OR_DARE_PROMPTS = {
  truth: [
    "What is your biggest fear?",
    "What is your most embarrassing moment?",
    "Who was your first crush?",
    "What is something nobody knows about you?",
    "What is your biggest regret?",
    "What is one secret you have never told anyone?",
    "What is your weirdest habit?",
    "What is the craziest thing you have done?"
  ],

  dare: [
    "Sing a song for 30 seconds",
    "Do 10 pushups",
    "Dance without music for 20 seconds",
    "Speak in an accent for the next round",
    "Show your last photo in your gallery",
    "Make a funny face and hold it for 30 seconds",
    "Tell a joke",
    "Do your best impression of someone"
  ]
};


export function pickTruthOrDare(count = 8) {
  const items = [
    ...TRUTH_OR_DARE_PROMPTS.truth.map(text => ({
      type: "truth",
      text
    })),

    ...TRUTH_OR_DARE_PROMPTS.dare.map(text => ({
      type: "dare",
      text
    }))
  ];

  return items
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}
