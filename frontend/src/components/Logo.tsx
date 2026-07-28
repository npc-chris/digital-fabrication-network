import Image from 'next/image';

interface LogoProps {
  priority?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ priority = false, className, width = 192, height = 48 }: LogoProps) {
  return (
    <Image
      src="/DFN - 800x200.png"
      alt="Digital Fabrication Network"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
