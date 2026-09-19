import { AD_EVERY_PREDICTIONS, HORIZON, POINTS_CORRECT, VISIBLE_CANDLES } from "@/lib/game";

// Shown on the landing page AND emitted as FAQPage structured data,
// so the markup always matches the visible content.
export const FAQ = [
  {
    q: "Is Amxinz free to play?",
    a: `Yes. Playing is free and there is nothing to deposit. A full-screen ad appears after every ${AD_EVERY_PREDICTIONS} predictions to cover running costs.`,
  },
  {
    q: "Are the charts real?",
    a: `Yes. Every round loads ${VISIBLE_CANDLES} real candles from Binance market data. The asset, the date and the price level stay hidden until you answer, so the chart can't be looked up.`,
  },
  {
    q: "How is my score calculated?",
    a: `You predict whether the close ${HORIZON} candles after the last visible candle will be higher or lower. A correct call earns ${POINTS_CORRECT} points and a wrong call costs ${POINTS_CORRECT}. Your total score decides your rank on the leaderboard.`,
  },
  {
    q: "Do I need a crypto wallet to play?",
    a: "No. You can log in with Google, or sign a message with an EVM wallet such as MetaMask. Signing never sends a transaction and costs no gas.",
  },
  {
    q: "Is this financial advice?",
    a: "No. Amxinz is a practice game for learning to read charts. Past patterns do not guarantee future results, and nothing here is investment advice.",
  },
];
