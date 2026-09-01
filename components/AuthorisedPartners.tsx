"use client";

import Image from "next/image";
import {
    useEffect,
    useMemo,
    useState,
} from "react";

type PartnerLogoResponse = {
    logos: string[];
};

export default function AuthorisedPartners() {
    const [partnerLogos, setPartnerLogos] =
        useState<string[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        const controller =
            new AbortController();

        async function loadLogos() {
            try {
                const response = await fetch(
                    "/api/authresellers",
                    {
                        signal:
                        controller.signal,
                    },
                );

                if (!response.ok) {
                    throw new Error(
                        `Failed to load partner logos: ${response.status}`,
                    );
                }

                const data =
                    (await response.json()) as PartnerLogoResponse;

                if (!controller.signal.aborted) {
                    setPartnerLogos(
                        Array.isArray(data.logos)
                            ? data.logos
                            : [],
                    );
                }
            } catch (error) {
                if (
                    error instanceof DOMException &&
                    error.name ===
                    "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Unable to load authorised partner logos:",
                    error,
                );

                setPartnerLogos([]);
            } finally {
                if (
                    !controller.signal
                        .aborted
                ) {
                    setLoading(false);
                }
            }
        }

        void loadLogos();

        return () =>
            controller.abort();
    }, []);

    /*
     * Duplicate the logos so the CSS
     * animation can loop seamlessly.
     */
    const scrollingLogos =
        useMemo(
            () => [
                ...partnerLogos,
                ...partnerLogos,
            ],
            [partnerLogos],
        );

    if (
        !loading &&
        partnerLogos.length === 0
    ) {
        return null;
    }

    return (
        <section
            className="
                overflow-hidden
                border-y
                border-slate-200
                bg-white
                py-12
                sm:py-14
            "
        >
            <div
                className="
                    mx-auto
                    max-w-7xl
                    px-5
                    sm:px-6
                    lg:px-8
                "
            >
                <div className="text-center">
                     <h2
                        className="
                            mt-2
                            font-heading
                            text-2xl
                            font-black
                            tracking-[-0.03em]
                            text-slate-950
                            sm:text-3xl
                        "
                    >
                        Authorised Partners
                    </h2>

                    <p
                        className="
                            mx-auto
                            mt-3
                            max-w-2xl
                            text-sm
                            leading-6
                            text-slate-500
                            sm:text-base
                        "
                    >
                        Working with trusted
                        property partners
                        across Tamil Nadu.
                    </p>
                </div>
            </div>

            <div
                className="
                    relative
                    mt-9
                    overflow-hidden
                "
            >
                {/* Left fade */}
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        left-0
                        z-10
                        w-16
                        bg-gradient-to-r
                        from-white
                        to-transparent
                        sm:w-28
                        lg:w-40
                    "
                />

                {/* Right fade */}
                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        inset-y-0
                        right-0
                        z-10
                        w-16
                        bg-gradient-to-l
                        from-white
                        to-transparent
                        sm:w-28
                        lg:w-40
                    "
                />

                {loading ? (
                    <div
                        className="
                            flex
                            items-center
                            justify-center
                            gap-8
                            overflow-hidden
                            px-6
                        "
                    >
                        {Array.from({
                            length: 6,
                        }).map(
                            (_, index) => (
                                <div
                                    key={
                                        index
                                    }
                                    className="
                                        h-[92px]
                                        w-[170px]
                                        shrink-0
                                        animate-pulse
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        sm:h-[104px]
                                        sm:w-[190px]
                                    "
                                />
                            ),
                        )}
                    </div>
                ) : (
                    <div
                        className="
                            authorised-partners-track
                            flex
                            w-max
                            items-center
                        "
                    >
                        {scrollingLogos.map(
                            (
                                logo,
                                index,
                            ) => (
                                <div
                                    key={`${logo}-${index}`}
                                    className="
        group
        mx-3
        flex
        h-[92px]
        w-[170px]
        shrink-0
        items-center
        justify-center
        rounded-2xl
        border
        border-slate-200/80
        bg-white
        px-6
        py-4
        shadow-sm
        transition-all
        duration-300
        hover:border-slate-300
        hover:bg-slate-50/60
        hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]
        sm:mx-4
        sm:h-[104px]
        sm:w-[190px]
    "
                                >
                                    <div
                                        className="
            relative
            h-full
            w-full
            transition-transform
            duration-300
            ease-out
            group-hover:scale-[1.035]
        "
                                    >
                                        <Image
                                            src={logo}
                                            alt="Authorised partner"
                                            fill
                                            sizes="190px"
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            ),
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}