"use client";

import { useEffect, useState } from "react";

// Shows a moment in the visitor's own time zone. The first render is a fixed UTC string,
// so server and browser HTML always match.
export function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState(() => `${iso.slice(0, 16).replace("T", " ")} UTC`);

  useEffect(() => {
    setText(
      new Date(iso).toLocaleString(undefined, {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );
  }, [iso]);

  return <time dateTime={iso}>{text}</time>;
}
