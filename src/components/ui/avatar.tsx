import Image from "next/image";

/**
 * Avatar (Figma 47:14) with the Avatar/Memoji artwork (52:4041) on color/bg/brand.
 * The memoji overflows the circle and is centred: 40px avatar → 40×48 art, 32px → 34×40 art.
 */
export function Avatar({ size = 40 }: { size?: 32 | 40 }) {
  const box = size === 40 ? "size-40" : "size-32";
  const art = size === 40 ? "h-48 w-40" : "h-40 w-34";
  return (
    <span className={`relative flex ${box} shrink-0 items-center justify-center overflow-clip rounded-full bg-brand`}>
      <Image src="/images/memoji.png" alt="" width={512} height={512} priority className={`absolute top-1/2 left-1/2 ${art} max-w-none -translate-1/2 object-cover`} />
    </span>
  );
}
