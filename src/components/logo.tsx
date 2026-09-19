// Placeholder mark. Swap this for your real logo, e.g.:
//   import Image from "next/image";

import Image from "next/image";

//   <Image src="/logo.png" alt="Amxinz" width={24} height={24} />
export function Logo() {
  return (
    <span
      aria-hidden
      className="grid size-6 place-items-center rounded-[6px] border bg-muted text-[13px] font-semibold"
    >
      <Image src="/logo.png" alt="Amxinz" width={24} height={24}  className="rounded-md"/>
    </span>
  );
}
