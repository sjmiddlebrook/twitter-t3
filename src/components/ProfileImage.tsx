import { UserCircle } from 'lucide-react';
import Image from 'next/image';

type ProfileImageProps = {
  src?: string | null;
  alt?: string;
  className?: string;
};

export function ProfileImage({ src, alt, className = '' }: ProfileImageProps) {
  if (!src) {
    return <UserCircle className="h-10 w-10 text-gray-600" strokeWidth={1} />;
  }
  return (
    <div
      className={`relative h-10 w-10 overflow-hidden rounded-full ${className}`}
    >
      <Image src={src} alt={alt ?? 'Profile Image'} quality={100} fill />
    </div>
  );
}
