import Image from "next/image";

type ProfileImageProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

export function ProfileImage({ src, alt, className }: ProfileImageProps) {
  return (
    <div className={`relative h-12 w-12 overflow-hidden rounded-full ${className}`}>
      {!src ? null : (<Image src={src} alt={alt ?? 'Profile Image'} quality={100} fill />) }
    </div>
  );
}
