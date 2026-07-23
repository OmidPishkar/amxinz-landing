import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/src/lib/db';
import Waitlist from '@/src/models/Waitlist';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ message: 'Valid email required' }, { status: 400 });
        }

        await connectDB();

        // Check if already exists
        const existing = await Waitlist.findOne({ email });
        if (existing) {
            return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
        }

        await Waitlist.create({ email });

        return NextResponse.json({ success: true, message: 'You are on the list!' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}