import Image from "next/image";

export function Avatar({ name, image, size = 20 }: { name: string; image: string | null; size?: number }) {
  if (image) {
    return (
      <Image
        src={image}
        alt=""
        width={size}
        height={size}
        unoptimized
        referrerPolicy="no-referrer"
        className="rounded-full"
      />
    );
  }
  return (
    <span
      aria-hidden
      className="grid place-items-center rounded-full bg-accent text-[10px] font-medium"
      style={{ width: size, height: size }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}
