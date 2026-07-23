// src/models/Waitlist.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWaitlist extends Document {
    email: string;
    createdAt: Date;
}

const WaitlistSchema = new Schema<IWaitlist>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Waitlist: Model<IWaitlist> =
    mongoose.models.Waitlist || mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);
export default Waitlist;