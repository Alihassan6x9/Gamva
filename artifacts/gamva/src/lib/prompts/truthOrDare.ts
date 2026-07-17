export const TRUTH_OR_DARE_PROMPTS = {
  truth: [
    "What is your biggest fear?",
    "What is your most embarrassing moment?",
    "Who was your first crush?",
    "What is something nobody knows about you?",
    "What is your biggest regret?",
    "What is one secret you never told anyone?",
    "If you could change one thing about yourself, what would it be?",
    "What's the most lie you've ever told?",
    "Who do you have a crush on right now?",
    "What's your biggest insecurity?",
    "Have you ever cheated on a test or exam?",
    "What's the most petty thing you've ever done?",
    "Who is someone you secretly admire?",
    "What's your guilty pleasure?",
    "If you could be anyone for a day, who would it be?",
    "What's something you've done that you're not proud of?",
    "What's your most unpopular opinion?",
    "Have you ever ghosted someone?",
    "What's the weirdest dream you've ever had?",
    "What's something you want to do but are too scared to try?",
    "Who's someone you thought was annoying but now like?",
    "What's the most money you've ever spent on something silly?",
    "Have you ever cried because of a movie or song?",
    "What's your most controversial take on something?"
  ],

  dare: [
    "Sing a song for 30 seconds",
    "Do 10 pushups",
    "Dance without music for 20 seconds",
    "Speak in an accent for the next round",
    "Tell a joke",
    "Make a funny face",
    "Lick your elbow",
    "Do your best impression of someone in this group",
    "Recite the alphabet backwards",
    "Call a friend and tell them a joke",
    "Post an embarrassing photo on social media (then delete it after 1 minute)",
    "Do a handstand against a wall for 15 seconds",
    "Text your crush something funny (if you have one)",
    "Wear something inside-out for the rest of the game",
    "Speak in rhymes for the next round",
    "Call someone and sing Happy Birthday to them",
    "Walk around the room like a model for 20 seconds",
    "Do a funny dance move that everyone has to copy",
    "Eat a spoonful of something spicy",
    "Write a love note to someone in the group (funny or serious)",
    "Do a mimicry of a celebrity for 30 seconds",
    "Spin around 10 times and then try to walk in a straight line",
    "FaceTime or call someone and ask them something silly",
    "Do the worm across the floor"
  ]
};


export function pickTruthOrDare(count = 24) {
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
