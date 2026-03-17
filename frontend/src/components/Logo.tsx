import Image from 'next/image';

interface LogoProps {
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ priority = false, className, width = 120, height = 36 }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Digital Fabrication Network"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
