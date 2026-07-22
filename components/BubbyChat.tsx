"use client";

import {
    FormEvent,
    KeyboardEvent,
    useEffect,
    useRef,
    useState,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    AnimatePresence,
    motion,
} from "framer-motion";
import {
    Bot,
    Building2,
    Home,
    Loader2,
    MapPin,
    MessageCircle,
    Send,
    Sparkles,
    Trash2,
    X,
} from "lucide-react";

import type {
    BubbyActionLink,
    BubbyApiResponse,
    BubbyChatMessage,
    BubbyPropertyResult,
    BubbySearchFilters,
} from "@/lib/bubby/types";

import {
    BUBBY_COMMERCIAL_TYPES,
    BUBBY_LISTING_PURPOSES,
    BUBBY_PROPERTY_TYPES,
    BUBBY_SORT_OPTIONS,
} from "@/lib/bubby/types";

interface UiMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    properties?: BubbyPropertyResult[];
    actions?: BubbyActionLink[];
    searchFilters?:
        | BubbySearchFilters
        | null;
}

const STORAGE_KEY =
    "propyours-bubby-conversation";

const HIDDEN_ROUTE_PREFIXES = [
    "/post-property",
    "/create-property",
    "/login",
    "/signup",
    "/dashboard",
    "/manage-properties",
    "/admin",
    "/checkout",
    "/payment",
];

const WELCOME_MESSAGE: UiMessage = {
    id: "bubby-welcome",
    role: "assistant",
    content:
        "Hi, I’m Bubby. Tell me the city, budget, property type, or number of bedrooms you need, and I’ll search PropYours.",
};

const QUICK_PROMPTS = [
    "Find 2 BHK apartments under ₹80 lakh",
    "Show rental homes in Chennai",
    "How do I post a property?",
];

export default function BubbyChat() {
    const pathname = usePathname() || "/";

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<
        UiMessage[]
    >([WELCOME_MESSAGE]);
    const [input, setInput] = useState("");
    const [loading, setLoading] =
        useState(false);
    const [storageLoaded, setStorageLoaded] =
        useState(false);

    const inputRef =
        useRef<HTMLTextAreaElement | null>(
            null,
        );

    const messagesEndRef =
        useRef<HTMLDivElement | null>(null);

    const hidden = isHiddenRoute(pathname);

    useEffect(() => {
        function handleOpenBubbyChat() {
            setOpen(true);
        }

        window.addEventListener(
            "open-bubby-chat",
            handleOpenBubbyChat,
        );

        return () => {
            window.removeEventListener(
                "open-bubby-chat",
                handleOpenBubbyChat,
            );
        };
    }, []);

    useEffect(() => {
        try {
            const savedConversation =
                sessionStorage.getItem(STORAGE_KEY);

            if (savedConversation) {
                const parsedConversation =
                    JSON.parse(
                        savedConversation,
                    ) as unknown;

                const validMessages =
                    parseStoredMessages(
                        parsedConversation,
                    );

                if (validMessages.length > 0) {
                    setMessages(validMessages);
                }
            }
        } catch {
            sessionStorage.removeItem(
                STORAGE_KEY,
            );
        } finally {
            setStorageLoaded(true);
        }
    }, []);

    useEffect(() => {
        if (!storageLoaded) {
            return;
        }

        try {
            sessionStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(messages.slice(-30)),
            );
        } catch {
            // Storage may be unavailable in private mode.
        }
    }, [messages, storageLoaded]);

    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!open) {
            return;
        }

        const focusTimer = window.setTimeout(
            () => {
                inputRef.current?.focus();
            },
            150,
        );

        return () => {
            window.clearTimeout(focusTimer);
        };
    }, [open]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages, loading, open]);

    useEffect(() => {
        if (
            !open ||
            window.matchMedia(
                "(min-width: 640px)",
            ).matches
        ) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        return () => {
            document.body.style.overflow =
                previousOverflow;
        };
    }, [open]);

    if (hidden) {
        return null;
    }

    async function sendMessage(
        content: string,
    ): Promise<void> {
        const trimmedContent = content.trim();

        if (
            !trimmedContent ||
            loading ||
            trimmedContent.length > 1_200
        ) {
            return;
        }

        const userMessage: UiMessage = {
            id: createId(),
            role: "user",
            content: trimmedContent,
        };

        const requestMessages = [
            ...messages,
            userMessage,
        ];

        const previousFilters =
            [...messages]
                .reverse()
                .find(
                    (message) =>
                        message.role ===
                        "assistant" &&
                        message.searchFilters != null,
                )?.searchFilters ?? null;

        setMessages(requestMessages);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(
                "/api/bubby",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    credentials: "same-origin",
                    body: JSON.stringify({
                        messages: requestMessages.map(
                            (message) => ({
                                role: message.role,
                                content: message.content,
                            }),
                        ),
                        previousFilters,
                    }),
                },
            );

            const responseBody =
                (await response
                    .json()
                    .catch(() => null)) as unknown;

            if (!response.ok) {
                const errorMessage =
                    isRecord(responseBody) &&
                    typeof responseBody.error ===
                    "string"
                        ? responseBody.error
                        : "Bubby is temporarily unavailable.";

                throw new Error(errorMessage);
            }

            const data =
                parseApiResponse(responseBody);

            if (!data) {
                throw new Error(
                    "Bubby returned an invalid response.",
                );
            }

            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    id: createId(),
                    role: "assistant",
                    content: data.reply,
                    properties: data.properties,
                    actions: data.actions,
                    searchFilters:
                    data.searchFilters,
                },
            ]);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Bubby is temporarily unavailable.";

            setMessages((currentMessages) => [
                ...currentMessages,
                {
                    id: createId(),
                    role: "assistant",
                    content: message,
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ): void {
        event.preventDefault();
        void sendMessage(input);
    }

    function handleInputKeyDown(
        event: KeyboardEvent<HTMLTextAreaElement>,
    ): void {
        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
        ) {
            event.preventDefault();
            void sendMessage(input);
        }
    }

    function clearConversation(): void {
        setMessages([WELCOME_MESSAGE]);
        setInput("");

        try {
            sessionStorage.removeItem(
                STORAGE_KEY,
            );
        } catch {
            // Ignore unavailable storage.
        }
    }

    const showQuickPrompts =
        messages.length === 1 &&
        messages[0]?.id ===
        WELCOME_MESSAGE.id;

    return (
        <>
            <AnimatePresence>
                {open ? (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close Bubby chat"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 z-[1190] bg-slate-950/25 backdrop-blur-[2px] sm:hidden"
                        />

                        <motion.section
                            role="dialog"
                            aria-modal="true"
                            aria-label="Chat with Bubby"
                            initial={{
                                opacity: 0,
                                y: 24,
                                scale: 0.97,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: 18,
                                scale: 0.97,
                            }}
                            transition={{
                                duration: 0.2,
                            }}
                            className="fixed inset-x-3 bottom-3 z-[1200] flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[400px]"
                        >
                            <header className="flex shrink-0 items-center gap-3 bg-primary px-4 py-4 text-white">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
                                    <Bot
                                        size={23}
                                        aria-hidden="true"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="font-heading text-base font-black">
                                            Bubby
                                        </h2>
                                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em]">
                      AI
                    </span>
                                    </div>

                                    <p className="mt-0.5 truncate text-xs font-medium text-white/75">
                                        Your PropYours property assistant
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={clearConversation}
                                    aria-label="Clear Bubby conversation"
                                    title="Clear conversation"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white/75 transition hover:bg-white/10 hover:text-white"
                                >
                                    <Trash2
                                        size={17}
                                        aria-hidden="true"
                                    />
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    aria-label="Close Bubby"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white/75 transition hover:bg-white/10 hover:text-white"
                                >
                                    <X
                                        size={19}
                                        aria-hidden="true"
                                    />
                                </button>
                            </header>

                            <div
                                aria-live="polite"
                                className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50/80 px-4 py-5"
                            >
                                {messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                        onNavigate={() =>
                                            setOpen(false)
                                        }
                                    />
                                ))}

                                {showQuickPrompts ? (
                                    <div className="space-y-2 pl-11">
                                        {QUICK_PROMPTS.map(
                                            (prompt) => (
                                                <button
                                                    key={prompt}
                                                    type="button"
                                                    onClick={() =>
                                                        void sendMessage(
                                                            prompt,
                                                        )
                                                    }
                                                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs font-bold leading-5 text-slate-700 shadow-sm transition hover:border-primary/30 hover:bg-teal-50 hover:text-primary"
                                                >
                                                    {prompt}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                ) : null}

                                {loading ? (
                                    <div className="flex items-end gap-2">
                                        <AssistantAvatar />

                                        <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                                            <Loader2
                                                size={15}
                                                className="animate-spin text-primary"
                                                aria-hidden="true"
                                            />
                                            Searching PropYours…
                                        </div>
                                    </div>
                                ) : null}

                                <div ref={messagesEndRef} />
                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="shrink-0 border-t border-slate-200 bg-white p-3"
                            >
                                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-primary/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10">
                  <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(event) =>
                          setInput(
                              event.target.value,
                          )
                      }
                      onKeyDown={
                          handleInputKeyDown
                      }
                      rows={1}
                      maxLength={1_200}
                      disabled={loading}
                      placeholder="Ask Bubby about a property…"
                      aria-label="Message Bubby"
                      className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-5 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
                  />

                                    <button
                                        type="submit"
                                        disabled={
                                            loading || !input.trim()
                                        }
                                        aria-label="Send message"
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {loading ? (
                                            <Loader2
                                                size={17}
                                                className="animate-spin"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <Send
                                                size={17}
                                                aria-hidden="true"
                                            />
                                        )}
                                    </button>
                                </div>

                                <p className="mt-2 px-1 text-center text-[10px] leading-4 text-slate-400">
                                    Verify listing details before making decisions.
                                </p>
                            </form>
                        </motion.section>
                    </>
                ) : null}
            </AnimatePresence>

            <AnimatePresence>
                {!open ? (
                    <motion.button
                        type="button"
                        aria-label="Open Bubby property assistant"
                        title="Ask Bubby"
                        initial={{
                            opacity: 0,
                            scale: 0.85,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.85,
                        }}
                        whileHover={{
                            scale: 1.05,
                        }}
                        whileTap={{
                            scale: 0.95,
                        }}
                        onClick={() => setOpen(true)}
                        className="fixed bottom-5 right-5 z-[1150] flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-[0_18px_45px_rgba(0,128,128,0.38)] transition hover:bg-primary-dark sm:bottom-6 sm:right-6"
                    >
                        <MessageCircle
                            size={27}
                            strokeWidth={2.4}
                            aria-hidden="true"
                        />

                        <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-accent text-slate-950">
              <Sparkles
                  size={10}
                  strokeWidth={3}
                  aria-hidden="true"
              />
            </span>
                    </motion.button>
                ) : null}
            </AnimatePresence>
        </>
    );
}

function MessageBubble({
                           message,
                           onNavigate,
                       }: {
    message: UiMessage;
    onNavigate: () => void;
}) {
    const assistant =
        message.role === "assistant";

    return (
        <div
            className={`flex items-end gap-2 ${
                assistant
                    ? "justify-start"
                    : "justify-end"
            }`}
        >
            {assistant ? <AssistantAvatar /> : null}

            <div
                className={`max-w-[84%] ${
                    assistant ? "" : "order-first"
                }`}
            >
                <div
                    className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                        assistant
                            ? "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                            : "rounded-br-md bg-primary text-white"
                    }`}
                >
                    {message.content}
                </div>

                {message.actions && message.actions.length > 0 ? (
                    <div className="mt-3 space-y-2">
                        {message.actions.map((action) => (
                            <BubbyActionCard
                                key={action.href}
                                action={action}
                                onNavigate={onNavigate}
                            />
                        ))}
                    </div>
                ) : null}

                {message.properties &&
                message.properties.length > 0 ? (
                    <div className="mt-3 space-y-2">
                        {message.properties.map(
                            (property) => (
                                <PropertyMiniCard
                                    key={property.id}
                                    property={property}
                                    onNavigate={onNavigate}
                                />
                            ),
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function AssistantAvatar() {
    return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Bot size={16} aria-hidden="true" />
        </div>
    );
}

function BubbyActionCard({
                             action,
                             onNavigate,
                         }: {
    action: BubbyActionLink;
    onNavigate: () => void;
}) {
    return (
        <Link
            href={action.href}
            onClick={onNavigate}
            className="group flex items-center gap-3 rounded-2xl border border-primary/20 bg-teal-50/70 p-3 transition hover:border-primary/40 hover:bg-teal-50 hover:shadow-sm"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/20">
                <Home
                    size={18}
                    aria-hidden="true"
                />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-950 transition group-hover:text-primary">
                    {action.label}
                </p>

                {action.description ? (
                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
                        {action.description}
                    </p>
                ) : null}
            </div>

            <span
                aria-hidden="true"
                className="text-lg font-bold text-primary transition-transform group-hover:translate-x-0.5"
            >
        →
      </span>
        </Link>
    );
}

function PropertyMiniCard({
                              property,
                              onNavigate,
                          }: {
    property: BubbyPropertyResult;
    onNavigate: () => void;
}) {
    const location = [
        property.locality,
        property.city,
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <Link
            href={property.url}
            onClick={onNavigate}
            className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-primary/30 hover:shadow-md"
        >
            <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
                    {property.propertyType ===
                    "Apartment" ? (
                        <Building2
                            size={20}
                            aria-hidden="true"
                        />
                    ) : (
                        <Home
                            size={20}
                            aria-hidden="true"
                        />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-xs font-black leading-5 text-slate-950 transition group-hover:text-primary">
                            {property.address}
                        </p>

                        {property.featured ? (
                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-amber-800">
                Featured
              </span>
                        ) : null}
                    </div>

                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-slate-500">
                        <MapPin
                            size={11}
                            className="shrink-0"
                            aria-hidden="true"
                        />
                        <span className="truncate">
              {location}
            </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-black text-slate-950">
              {formatPrice(property.price)}
            </span>

                        <span className="text-[10px] font-bold text-slate-500">
              {property.bedrooms
                  ? `${property.bedrooms} BHK`
                  : property.propertyType}
            </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

function formatPrice(price: number): string {
    if (price >= 10_000_000) {
        const crores = price / 10_000_000;

        return `₹${crores.toFixed(
            Number.isInteger(crores) ? 0 : 2,
        )} Cr`;
    }

    if (price >= 100_000) {
        const lakhs = price / 100_000;

        return `₹${lakhs.toFixed(
            Number.isInteger(lakhs) ? 0 : 1,
        )} L`;
    }

    return `₹${price.toLocaleString(
        "en-IN",
    )}`;
}

function isHiddenRoute(
    pathname: string,
): boolean {
    return HIDDEN_ROUTE_PREFIXES.some(
        (prefix) =>
            pathname === prefix ||
            pathname.startsWith(`${prefix}/`),
    );
}

function createId(): string {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;
}

function isNullableString(
    value: unknown,
): value is string | null {
    return (
        value === null ||
        typeof value === "string"
    );
}

function isNullableNumber(
    value: unknown,
): value is number | null {
    return (
        value === null ||
        (
            typeof value === "number" &&
            Number.isFinite(value)
        )
    );
}

function parseStoredSearchFilters(
    value: unknown,
): BubbySearchFilters | null {
    if (!isRecord(value)) {
        return null;
    }

    const requiredKeys = [
        "listingPurpose",
        "propertyType",
        "commercialType",
        "city",
        "locality",
        "minPrice",
        "maxPrice",
        "minBedrooms",
        "maxBedrooms",
        "minBathrooms",
        "maxBathrooms",
        "minSize",
        "maxSize",
        "amenities",
        "negotiable",
        "sort",
        "searchText",
    ] as const;

    if (
        !requiredKeys.every(
            (key) => key in value,
        )
    ) {
        return null;
    }

    if (
        !isNullableString(
            value.listingPurpose,
        ) ||
        !isNullableString(
            value.propertyType,
        ) ||
        !isNullableString(
            value.commercialType,
        ) ||
        !isNullableString(
            value.city,
        ) ||
        !isNullableString(
            value.locality,
        ) ||
        !isNullableNumber(
            value.minPrice,
        ) ||
        !isNullableNumber(
            value.maxPrice,
        ) ||
        !isNullableNumber(
            value.minBedrooms,
        ) ||
        !isNullableNumber(
            value.maxBedrooms,
        ) ||
        !isNullableNumber(
            value.minBathrooms,
        ) ||
        !isNullableNumber(
            value.maxBathrooms,
        ) ||
        !isNullableNumber(
            value.minSize,
        ) ||
        !isNullableNumber(
            value.maxSize,
        ) ||
        !Array.isArray(
            value.amenities,
        ) ||
        !value.amenities.every(
            (item) =>
                typeof item ===
                "string",
        ) ||
        !(
            value.negotiable ===
            null ||
            typeof value.negotiable ===
            "boolean"
        ) ||
        !isNullableString(
            value.sort,
        ) ||
        !isNullableString(
            value.searchText,
        )
    ) {
        return null;
    }

    return {
        listingPurpose:
            value.listingPurpose as
                BubbySearchFilters["listingPurpose"],

        propertyType:
            value.propertyType as
                BubbySearchFilters["propertyType"],

        commercialType:
            value.commercialType as
                BubbySearchFilters["commercialType"],

        city: value.city,
        locality: value.locality,
        minPrice: value.minPrice,
        maxPrice: value.maxPrice,
        minBedrooms:
        value.minBedrooms,
        maxBedrooms:
        value.maxBedrooms,
        minBathrooms:
        value.minBathrooms,
        maxBathrooms:
        value.maxBathrooms,
        minSize: value.minSize,
        maxSize: value.maxSize,

        amenities:
            value.amenities as string[],

        negotiable:
        value.negotiable,

        sort:
            value.sort as
                BubbySearchFilters["sort"],

        searchText:
        value.searchText,
    };
}

function parseStoredMessages(
    value: unknown,
): UiMessage[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(isRecord)
        .filter(
            (item) =>
                typeof item.id === "string" &&
                (item.role === "user" ||
                    item.role === "assistant") &&
                typeof item.content ===
                "string",
        )
        .map(
            (item): UiMessage => ({
                id: item.id as string,
                role: item.role as
                    | "user"
                    | "assistant",
                content: (
                    item.content as string
                ).slice(0, 2_000),

                properties: Array.isArray(
                    item.properties,
                )
                    ? (item.properties as BubbyPropertyResult[])
                    : undefined,

                actions: Array.isArray(
                    item.actions,
                )
                    ? (item.actions as BubbyActionLink[])
                    : undefined,

                searchFilters: parseStoredSearchFilters(
                    item.searchFilters,
                ),
            }),
        )
        .slice(-30);
}

function parseApiResponse(
    value: unknown,
): BubbyApiResponse | null {
    if (
        !isRecord(value) ||
        typeof value.reply !== "string" ||
        !Array.isArray(
            value.properties,
        ) ||
        !Array.isArray(value.actions)
    ) {
        return null;
    }

    return {
        reply: value.reply,
        properties:
            value.properties as BubbyPropertyResult[],
        actions:
            value.actions as BubbyActionLink[],
        searchFilters:
            parseStoredSearchFilters(
                value.searchFilters,
            ),
    };
}

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}