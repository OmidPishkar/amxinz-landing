"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";

export function UserMenu({ name, image }: { name: string; image: string | null }) {
  return (
    <div className="ml-1 flex items-center gap-2">
      <Link
        href="/profile"
        aria-label="Your profile"
        className="flex items-center gap-2 rounded-md px-1.5 py-1 text-[13px] hover:bg-accent"
      >
        <Avatar name={name} image={image} />
        <span className="hidden max-w-[120px] truncate sm:inline">{name}</span>
      </Link>
      <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
        <LogOut />
        Log out
      </Button>
    </div>
  );
}
