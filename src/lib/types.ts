import type { ObjectId } from "mongodb";

export interface UserDoc {
  _id: ObjectId;
  provider: "google" | "wallet";
  providerId: string;
  name: string;
  image: string | null;
  score: number;
  played: number;
  correct: number;
  createdAt: Date;
  // profile (all optional: older users do not have them)
  avatarUrl?: string | null;
  email?: string | null;
  emailVerified?: boolean;
  username?: string | null; // lowercase, unique; see the "username" index in the username route
}

export interface NonceDoc {
  address: string;
  nonce: string;
  expiresAt: Date;
}

export interface CandleDoc {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface RoundDoc {
  _id: ObjectId;
  userId: string;
  symbol: string;
  interval: string;
  startTime: number;
  outcome: "up" | "down";
  future: CandleDoc[];
  answered: boolean;
  choice?: "up" | "down";
  correct?: boolean;
  createdAt: Date;
  answeredAt?: Date;
}

export interface EmailTokenDoc {
  userId: string;
  email: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface RateDoc {
  _id: string;
  n: number;
  expiresAt: Date;
}
