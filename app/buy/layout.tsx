import type {
    Metadata,
} from "next";

export const metadata:
    Metadata = {
    title:
        "Buy, Rent and Commercial Property",

    description:
        "Search residential, rental and commercial properties across Tamil Nadu by city, locality, property type, bedrooms and price.",

    alternates: {
        canonical:
            "/buy",
    },

    openGraph: {
        title:
            "Property Search in Tamil Nadu",

        description:
            "Search homes, apartments, land and commercial property across Tamil Nadu.",

        url:
            "/buy",
    },
};

export default function BuyLayout({
                                      children,
                                  }: Readonly<{
    children:
        React.ReactNode;
}>) {
    return children;
}