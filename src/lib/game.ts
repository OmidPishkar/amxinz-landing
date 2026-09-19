// Shared game constants (safe to import on both client and server).
export const VISIBLE_CANDLES = 100; // candles the player sees
export const HORIZON = 10; // the player predicts the close this many candles ahead
export const POINTS_CORRECT = 10;
export const POINTS_WRONG = -10; // zero expected value for random guessing

// Ads
export const AD_EVERY_PREDICTIONS = 5; // a full-screen ad after every N predictions
export const AD_SKIP_SECONDS = 5; // the player can continue after this many seconds
