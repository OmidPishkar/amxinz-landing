// components/Providers.tsx
'use client';

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/src/context/SocketContext";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SocketProvider>
                {children}
            </SocketProvider>
        </SessionProvider>
    );
}