import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
    href?: string;
    priority?: boolean;
    className?: string;
    imageClassName?: string;
};

export default function BrandLogo({
                                      href = "/",
                                      priority = false,
                                      className = "",
                                      imageClassName = "",
                                  }: BrandLogoProps) {
    const logo = (
        <span
            className={`relative block h-12 w-[220px] shrink-0 ${className}`}
        >
            <Image
                src="/propyoursTRANSPARENTSUBTITLE.png"
                alt="PropYours — Real Estate Simplified"
                fill
                priority={priority}
                sizes="220px"
                className={`object-contain object-left ${imageClassName}`}
            />
        </span>
    );

    if (!href) {
        return logo;
    }

    return (
        <Link
            href={href}
            aria-label="PropYours home"
            className="inline-flex shrink-0 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
        >
            {logo}
        </Link>
    );
}