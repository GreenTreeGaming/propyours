import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
    href?: string;
    priority?: boolean;
    className?: string;
    imageClassName?: string;
};

export default function BrandLogo({
                                      href,
                                      priority = false,
                                      className = "",
                                      imageClassName = "",
                                  }: BrandLogoProps) {
    const logo = (
        <span
            className={[
                "relative block shrink-0",
                "h-[30px] w-[150px]",
                "sm:h-[32px] sm:w-[160px]",
                "lg:h-[34px] lg:w-[168px]",
                className,
            ].join(" ")}
        >
            <Image
                src="/wordlogo3.jpeg"
                alt="PropYours"
                fill
                priority={priority}
                sizes="315px"
                className={[
                    "object-contain object-left",
                    "origin-left",
                    "scale-[1.85]",
                    "translate-y-[1px]",
                    "transition-[transform,opacity]",
                    "duration-200",
                    imageClassName,
                ].join(" ")}
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
            className={[
                "group inline-flex shrink-0 items-center",
                "rounded-lg",
                "outline-none",
                "transition-opacity duration-200",
                "hover:opacity-90",
                "focus-visible:ring-2",
                "focus-visible:ring-primary/30",
                "focus-visible:ring-offset-2",
            ].join(" ")}
        >
            {logo}
        </Link>
    );
}