"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/avatar";
import { LoginDialog } from "@/components/login-dialog";

export function HamburgerMenu({
  loggedIn,
  name,
  image,
}: {
  loggedIn: boolean;
  name: string;
  image: string | null;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close();
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X /> : <Menu />}
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-lg border bg-popover py-1 text-popover-foreground shadow-lg"
        >
          {loggedIn ? (
            <>
              <Link
                role="menuitem"
                href="/profile"
                onClick={close}
                className="flex items-center gap-2 px-3 py-2 text-[13px] hover:bg-accent"
              >
                <Avatar name={name} image={image} size={20} />
                <span className="truncate">{name}</span>
              </Link>
              <button
                role="menuitem"
                onClick={() => {
                  close();
                  signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-accent"
              >
                <LogOut className="size-4" />
                Log out
              </button>
            </>
          ) : (
            <LoginDialog>
              <button
                role="menuitem"
<<<<<<< HEAD
                onClick={() => setOpen(true)}
=======
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
                className="block w-full px-3 py-2 text-left text-[13px] hover:bg-accent"
              >
                Log in
              </button>
            </LoginDialog>
          )}

          <div className="my-1 border-t" />

<<<<<<< HEAD
          <Link
            role="menuitem"
            href="/challenges"
            onClick={close}
            className="block px-3 py-2 text-[13px] hover:bg-accent"
          >
            Challenges
          </Link>
=======
>>>>>>> 7bcaed3947e2fda50ba2ff29e12b2bfd18c98be7
          <Link role="menuitem" href="/weblog" onClick={close} className="block px-3 py-2 text-[13px] hover:bg-accent">
            Weblog
          </Link>
          <Link
            role="menuitem"
            href="/leaderboard"
            onClick={close}
            className="block px-3 py-2 text-[13px] hover:bg-accent"
          >
            Leaderboard
          </Link>
        </div>
      )}
    </div>
  );
}
