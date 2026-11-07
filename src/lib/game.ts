// Shared game constants (safe to import on both client and server).
export const VISIBLE_CANDLES = 100; // candles the player sees
export const HORIZON = 10; // the player predicts the close this many candles ahead
export const POINTS_CORRECT = 10;
export const POINTS_WRONG = -10; // zero expected value for random guessing

// Ads
export const AD_EVERY_PREDICTIONS = 5; // a full-screen ad after every N predictions
export const AD_SKIP_SECONDS = 5; // the player can continue after this many seconds
<<<<<<< HEAD

// Challenges
export const CHALLENGE_SIZE = 10; // predictions per challenge
export const CHALLENGE_DAYS = [1, 3, 7] as const; // how long a challenge stays open
=======
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
