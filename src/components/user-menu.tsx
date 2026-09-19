"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";

export function UserMenu({ name, image }: { name: string; image: string | null }) {
  return (
    <div className="ml-1 flex items-center gap-2">
      <span className="flex items-center gap-2 text-[13px]">
        <Avatar name={name} image={image} />
        <span className="hidden max-w-[120px] truncate sm:inline">{name}</span>
      </span>
      <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
        <LogOut />
        Logout
      </Button>
    </div>
  );
}
