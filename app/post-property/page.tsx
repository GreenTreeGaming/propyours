"use client";

import {
    FormEvent,
    ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Briefcase,
    Building,
    Building2,
    Check,
    ChevronDown,
    CircleCheckBig,
    Factory,
    FileText,
    GraduationCap,
    Home,
    Hotel,
    Image as ImageIcon,
    IndianRupee,
    Info,
    Landmark,
    Layers,
    LayoutGrid,
    Loader2,
    Map,
    MapPin,
    Plus,
    Ruler,
    Save,
    ShoppingBag,
    Stethoscope,
    Store,
    Trash2,
    Trees,
    Upload,
    Users,
    Utensils,
    Video,
    Warehouse,
    X,
    type LucideIcon,
} from "lucide-react";

import ProtectedRoute from "@/components/ProtectedRoute";
import { UploadDropzone } from "@/lib/uploadthing";
import {
    PLAN_CATALOG,
    isPlanTier,
} from "@/lib/plan-catalog";
import {
    clearStoredUser,
    getStoredUser,
} from "@/lib/browser-user";
import {
    COMMERCIAL_TYPE_GROUPS,
    LAND_PROPERTY_TYPES,
    OWNERSHIP_TYPES,
    PRICE_TYPES,
    PROPERTY_CATEGORIES,
    PROPERTY_PURPOSES,
    RESIDENTIAL_PROPERTY_TYPES,
    SIZE_UNITS,
    TAMIL_NADU_CITIES,
    getAmenityCategories,
    getTamilNaduLocalities,
    isCommercialPropertyType,
    isLandPropertyType,
    type PropertyCategory,
} from "@/lib/property-form-options";

type StepId =
    | "category"
    | "location"
    | "details"
    | "pricing"
    | "media"
    | "review";

interface StoredUser {
    role?: string;

    plan?: {
        audience?:
            | "owner"
            | "builder"
            | "agent";

        tier?: string;
        status?: string;
    };
}

interface UploadDeleteGrant {
    fileKey: string;
    deleteToken: string;
}

interface UnitConfigurationForm {
    id: string;
    bedrooms: string;
    size: string;
    sizeUnit: string;
    price: string;
}

interface PropertyForm {
    category: PropertyCategory;
    purpose: string;
    propertyType: string;
    commercialType: string;
    description: string;
    address: string;
    locality: string;
    city: string;
    state: "Tamil Nadu";
    landmark: string;
    developerName: string;
    uds: string;
    size: string;
    sizeUnit: string;
    dimensions: string;
    ownershipType: string;
    unitConfigurations: UnitConfigurationForm[];
    price: string;
    zeroCommission: boolean;
    priceType: string;
    negotiable: boolean;
    bedrooms: string;
    bathrooms: string;
    gstApplicable: boolean;
    registrationChargesAdditional: boolean;
    floors: string;
    amenities: string[];
    images: string[];
    videoLinks: string[];
    uploadDeleteGrants: Record<
        string,
        UploadDeleteGrant
    >;
    brochure: {
        url: string;
        fileName: string;
    } | null;
}

function createUnitConfiguration():
    UnitConfigurationForm {
    return {
        id:
            typeof crypto !==
            "undefined" &&
            "randomUUID" in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,

        bedrooms: "",
        size: "",
        sizeUnit: "sqft",
        price: "",
    };
}

interface UploadFile {
    url?: string;
    ufsUrl?: string;
    key?: string;
    name?: string;
    serverData?: {
        url?: string;
        fileKey?: string;
        deleteToken?: string;
    } | null;
}

interface UploadedFileDescriptor {
    url: string;
    fileKey: string | null;
    deleteToken: string | null;
    fileName?: string;
}

interface StepDefinition {
    id: StepId;
    title: string;
    shortTitle: string;
    description: string;
    icon: LucideIcon;
}

const FORM_STORAGE_KEY =
    "post-property-form-v3";
const STEP_STORAGE_KEY =
    "post-property-step-v3";

const STEPS: StepDefinition[] = [
    {
        id: "category",
        title: "Listing type",
        shortTitle: "Type",
        description: "Purpose, category and subtype",
        icon: Building2,
    },
    {
        id: "location",
        title: "Location & area",
        shortTitle: "Location",
        description: "Tamil Nadu location and size",
        icon: MapPin,
    },
    {
        id: "details",
        title: "Property details",
        shortTitle: "Details",
        description: "Category-specific specifications",
        icon: LayoutGrid,
    },
    {
        id: "pricing",
        title: "Pricing",
        shortTitle: "Price",
        description: "Amount and negotiability",
        icon: IndianRupee,
    },
    {
        id: "media",
        title: "Facilities & media",
        shortTitle: "Media",
        description: "Amenities, photos and videos",
        icon: ImageIcon,
    },
    {
        id: "review",
        title: "Review & publish",
        shortTitle: "Review",
        description: "Check the complete listing",
        icon: BadgeCheck,
    },
];

const DEFAULT_FORM: PropertyForm = {
    category: "residential",
    purpose: "Sell",
    propertyType: "Apartment",
    commercialType: "",
    description: "",
    address: "",
    locality: "",
    city: "",
    state: "Tamil Nadu",
    landmark: "",
    developerName: "",
    uds: "",
    unitConfigurations: [],
    size: "",
    sizeUnit: "sqft",
    dimensions: "",
    ownershipType: "Freehold",
    price: "",
    priceType: "Total",
    negotiable: true,
    zeroCommission: true,
    gstApplicable: false,
    registrationChargesAdditional: false,
    bedrooms: "",
    bathrooms: "",
    floors: "",
    amenities: [],
    images: [],
    videoLinks: [],
    uploadDeleteGrants: {},
    brochure: null,
};

const CATEGORY_ICONS: Record<PropertyCategory, LucideIcon> = {
    residential: Home,
    land: Trees,
    commercial: Building2,
};

const PROPERTY_ICONS: Record<string, LucideIcon> = {
    Apartment: Building2,
    "Independent House": Home,
    "Independent Floor": Layers,
    Duplex: LayoutGrid,
    Villa: Home,
    Penthouse: Building,
    "Farm House": Trees,
    Plot: Map,
    "Agricultural Land": Trees,
};

const RESIDENTIAL_TYPE_DESCRIPTIONS: Record<
    (typeof RESIDENTIAL_PROPERTY_TYPES)[number],
    string
> = {
    Apartment:
        "A self-contained home in a multi-unit building or gated community.",
    "Independent House":
        "A standalone home with its own entrance, plot and private space.",
    "Independent Floor":
        "One complete floor in a low-rise independent building.",
    Duplex:
        "A two-level home connected internally as one residence.",
    Villa:
        "A premium standalone or gated-community home with more private space.",
    Penthouse:
        "A premium top-floor residence, often with a terrace or wider views.",
    "Farm House":
        "A residential home on a larger rural or semi-rural parcel.",
};

const COMMERCIAL_ICONS: Record<string, LucideIcon> = {
    "Office Space": Briefcase,
    "Co-working Space": Users,
    "Business Centre": Landmark,
    "Commercial Building": Building2,
    Shop: Store,
    Showroom: ShoppingBag,
    "Restaurant / Cafe": Utensils,
    "Hotel / Resort": Hotel,
    "Warehouse / Godown": Warehouse,
    "Industrial Shed": Factory,
    Factory,
    "Clinic / Hospital": Stethoscope,
    "School / Institution": GraduationCap,
    "Commercial Land": Map,
};

function loadInitialForm(): PropertyForm {
    if (typeof window === "undefined") {
        return DEFAULT_FORM;
    }

    const saved = localStorage.getItem(FORM_STORAGE_KEY);

    if (!saved) {
        return DEFAULT_FORM;
    }

    try {
        const parsed = JSON.parse(saved) as Partial<PropertyForm>;

        return {
            ...DEFAULT_FORM,
            ...parsed,
            state: "Tamil Nadu",
            amenities: Array.isArray(parsed.amenities)
                ? parsed.amenities
                : [],
            images: Array.isArray(parsed.images)
                ? parsed.images
                : [],
            videoLinks: Array.isArray(parsed.videoLinks)
                ? parsed.videoLinks
                : [],
            unitConfigurations:
                Array.isArray(
                    parsed.unitConfigurations,
                )
                    ? parsed.unitConfigurations
                    : [],
            uploadDeleteGrants:
                typeof parsed.uploadDeleteGrants === "object" &&
                parsed.uploadDeleteGrants !== null &&
                !Array.isArray(parsed.uploadDeleteGrants)
                    ? parsed.uploadDeleteGrants
                    : {},
        };
    } catch {
        return DEFAULT_FORM;
    }
}

function loadInitialStep(): StepId {
    if (typeof window === "undefined") {
        return "category";
    }

    const saved = localStorage.getItem(STEP_STORAGE_KEY);

    return STEPS.some((step) => step.id === saved)
        ? (saved as StepId)
        : "category";
}

function optionalNumber(value: string): number | null {
    if (!value.trim()) {
        return null;
    }

    return Number(value);
}

function isValidVideoUrl(value: string): boolean {
    if (!value.trim()) {
        return true;
    }

    try {
        const host = new URL(value).hostname;

        return [
            "youtube.com",
            "www.youtube.com",
            "youtu.be",
            "vimeo.com",
            "www.vimeo.com",
        ].includes(host);
    } catch {
        return false;
    }
}

function getUploadedFileDescriptor(
    file: UploadFile,
): UploadedFileDescriptor | null {
    const url =
        file.ufsUrl ||
        file.url ||
        file.serverData?.url;

    if (!url) {
        return null;
    }

    return {
        url,
        fileKey:
            file.key ||
            file.serverData?.fileKey ||
            null,
        deleteToken:
            file.serverData?.deleteToken ||
            null,
        fileName: file.name,
    };
}

function formatPrice(value: string): string {
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
        return "Price not set";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(amount);
}

function getDisplayType(form: PropertyForm): string {
    return form.category === "commercial"
        ? form.commercialType || "Commercial property"
        : form.propertyType;
}

function FieldLabel({
                        children,
                        required = false,
                        hint,
                    }: {
    children: ReactNode;
    required?: boolean;
    hint?: string;
}) {
    return (
        <span className="mb-2 flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.1em] text-slate-500">
      <span>
        {children}
          {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
            {hint ? (
                <span className="normal-case tracking-normal text-slate-400">
          {hint}
        </span>
            ) : null}
    </span>
    );
}

function ErrorText({ children }: { children: ReactNode }) {
    return (
        <p className="mt-2 text-xs font-bold text-red-600">
            {children}
        </p>
    );
}

function SelectField({
                         value,
                         onChange,
                         children,
                         disabled = false,
                         ariaLabel,
                     }: {
    value: string;
    onChange: (value: string) => void;
    children: ReactNode;
    disabled?: boolean;
    ariaLabel: string;
}) {
    return (
        <span className="relative block">
      <select
          value={value}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-bold text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      >
        {children}
      </select>
      <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
      />
    </span>
    );
}

function SectionHeading({
                            eyebrow,
                            title,
                            description,
                            icon: Icon,
                        }: {
    eyebrow: string;
    title: string;
    description: string;
    icon: LucideIcon;
}) {
    return (
        <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-slate-200">
        <Icon size={21} aria-hidden="true" />
      </span>
            <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                    {eyebrow}
                </p>
                <h2 className="mt-2 font-heading text-2xl font-black tracking-[-0.03em] text-slate-950 sm:text-3xl">
                    {title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ReviewCard({
                        title,
                        onEdit,
                        children,
                    }: {
    title: string;
    onEdit: () => void;
    children: ReactNode;
}) {
    return (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-950">{title}</h3>
                <button
                    type="button"
                    onClick={onEdit}
                    className="text-xs font-black text-primary"
                >
                    Edit
                </button>
            </div>
            <div className="mt-4 space-y-4">{children}</div>
        </div>
    );
}

function ReviewRow({
                       label,
                       value,
                   }: {
    label: string;
    value: string;
}) {
    return (
        <div>
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                {label}
            </p>
            <p className="mt-1 whitespace-pre-line text-sm font-bold leading-6 text-slate-700">
                {value}
            </p>
        </div>
    );
}

export default function PostPropertyPage() {
    const router = useRouter();
    const [user, setUser] = useState<StoredUser | null>(null);
    const [form, setForm] = useState<PropertyForm>(loadInitialForm);
    const [activeStep, setActiveStep] =
        useState<StepId>(loadInitialStep);
    const [errors, setErrors] =
        useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [uploadMessage, setUploadMessage] = useState("");
    const [draftSaved, setDraftSaved] = useState(false);

    useEffect(() => {
        const syncUser = () => {
            const currentUser =
                getStoredUser() as StoredUser | null;

            if (!currentUser) {
                clearStoredUser();
            }

            setUser(currentUser);
        };

        syncUser();
        window.addEventListener("storage", syncUser);

        return () =>
            window.removeEventListener("storage", syncUser);
    }, []);

    useEffect(() => {
        const saveTimer = window.setTimeout(() => {
            localStorage.setItem(
                FORM_STORAGE_KEY,
                JSON.stringify(form),
            );
            localStorage.setItem(STEP_STORAGE_KEY, activeStep);
            setDraftSaved(true);
        }, 250);

        const statusTimer = window.setTimeout(
            () => setDraftSaved(false),
            1800,
        );

        return () => {
            window.clearTimeout(saveTimer);
            window.clearTimeout(statusTimer);
        };
    }, [activeStep, form]);

    const hasActivePaidPlan =
        user?.plan?.status === "active";
    const storedTier = user?.plan?.tier;
    const currentTier =
        isPlanTier(storedTier) &&
        (storedTier === "silver" || hasActivePaidPlan)
            ? storedTier
            : "silver";
    const currentPlan = PLAN_CATALOG[currentTier];
    const maxImages = currentPlan.entitlements.maxImages;
    const maxVideoLinks =
        currentPlan.entitlements.maxVideoLinks;

    const activeStepIndex = STEPS.findIndex(
        (step) => step.id === activeStep,
    );
    const isLand = isLandPropertyType(form.propertyType);
    const isCommercial =
        isCommercialPropertyType(form.propertyType);
    const displayType = getDisplayType(form);

    const localityOptions = useMemo(
        () =>
            form.city
                ? getTamilNaduLocalities(form.city)
                : [],
        [form.city],
    );

    const applicablePurposes = useMemo(
        () =>
            form.category === "residential"
                ? PROPERTY_PURPOSES
                : PROPERTY_PURPOSES.filter(
                    (purpose) => purpose !== "PG/CO-Living",
                ),
        [form.category],
    );

    const amenityCategories = useMemo(
        () => getAmenityCategories(form.category),
        [form.category],
    );

    function updateForm(patch: Partial<PropertyForm>) {
        setForm((current) => ({
            ...current,
            ...patch,
        }));
    }

    function addUnitConfiguration() {
        setForm((current) => ({
            ...current,

            unitConfigurations: [
                ...current.unitConfigurations,
                createUnitConfiguration(),
            ],
        }));

        setErrors((current) => {
            const next = {
                ...current,
            };

            delete next.unitConfigurations;

            return next;
        });
    }

    function updateUnitConfiguration(
        id: string,
        field:
            | "bedrooms"
            | "size"
            | "sizeUnit"
            | "price",
        value: string,
    ) {
        setForm((current) => ({
            ...current,

            unitConfigurations:
                current.unitConfigurations.map(
                    (configuration) =>
                        configuration.id === id
                            ? {
                                ...configuration,
                                [field]: value,
                            }
                            : configuration,
                ),
        }));
    }

    function removeUnitConfiguration(
        id: string,
    ) {
        setForm((current) => ({
            ...current,

            unitConfigurations:
                current.unitConfigurations.filter(
                    (configuration) =>
                        configuration.id !== id,
                ),
        }));
    }

    function selectCategory(category: PropertyCategory) {
        if (category === "commercial") {
            updateForm({
                category,
                propertyType: "Commercial",
                commercialType: "",
                unitConfigurations: [],
                purpose:
                    form.purpose === "PG/CO-Living"
                        ? "Rent"
                        : form.purpose,
                bedrooms: "",
                bathrooms: "",
                floors: "",
                amenities: [],
            });
            return;
        }

        if (category === "land") {
            updateForm({
                category,
                propertyType: "Plot",
                commercialType: "",
                unitConfigurations: [],
                purpose:
                    form.purpose === "PG/CO-Living"
                        ? "Sell"
                        : form.purpose,
                bedrooms: "",
                bathrooms: "",
                floors: "",
                amenities: [],
            });
            return;
        }

        updateForm({
            category,
            propertyType: "Apartment",
            commercialType: "",
            amenities: [],
        });
    }

    function validateStep(step: StepId): boolean {
        const nextErrors: Record<string, string> = {};

        if (step === "category") {
            if (!form.purpose) {
                nextErrors.purpose =
                    "Select what you want to do with the property.";
            }

            if (!form.propertyType) {
                nextErrors.propertyType =
                    "Select a property type.";
            }

            if (
                form.category === "commercial" &&
                !form.commercialType
            ) {
                nextErrors.commercialType =
                    "Select the commercial property type.";
            }
        }

        if (step === "location") {
            if (!form.city) {
                nextErrors.city = "Select a city.";
            }
            if (!form.locality) {
                nextErrors.locality =
                    "Select a locality or area.";
            }
            if (!form.address.trim()) {
                nextErrors.address =
                    "Enter the street address.";
            }

            const size = Number(form.size);

            if (!Number.isFinite(size) || size <= 0) {
                nextErrors.size =
                    "Enter a valid property size.";
            }

            const uds =
                optionalNumber(form.uds);

            if (
                uds !== null &&
                (
                    !Number.isFinite(uds) ||
                    uds < 0 ||
                    uds > 100
                )
            ) {
                nextErrors.uds =
                    "UDS must be between 0% and 100%.";
            }

            if (
                form.unitConfigurations.length > 0
            ) {
                const invalidConfiguration =
                    form.unitConfigurations.some(
                        (configuration) => {
                            const bedrooms =
                                Number(
                                    configuration.bedrooms,
                                );

                            const size =
                                Number(
                                    configuration.size,
                                );

                            const price =
                                Number(
                                    configuration.price,
                                );

                            return (
                                !Number.isFinite(
                                    bedrooms,
                                ) ||
                                !Number.isInteger(
                                    bedrooms,
                                ) ||
                                bedrooms < 0 ||
                                bedrooms > 20 ||
                                !Number.isFinite(
                                    size,
                                ) ||
                                size <= 0 ||
                                !Number.isFinite(
                                    price,
                                ) ||
                                price <= 0
                            );
                        },
                    );

                if (invalidConfiguration) {
                    nextErrors.unitConfigurations =
                        "Complete the BHK, size and price for every unit configuration.";
                }
            }
        }

        if (step === "details") {
            const numericFields: Array<[string, string]> =
                form.category === "residential"
                    ? [
                        ["bedrooms", form.bedrooms],
                        ["bathrooms", form.bathrooms],
                        ["floors", form.floors],
                    ]
                    : form.category === "commercial"
                        ? [
                            ["bathrooms", form.bathrooms],
                            ["floors", form.floors],
                        ]
                        : [];

            numericFields.forEach(([key, value]) => {
                if (
                    value.trim() &&
                    (!Number.isFinite(Number(value)) ||
                        Number(value) < 0)
                ) {
                    nextErrors[key] =
                        "Enter a valid non-negative number.";
                }
            });
        }

        if (step === "pricing") {
            const price = Number(form.price);

            if (!Number.isFinite(price) || price <= 0) {
                nextErrors.price =
                    "Enter a valid asking price.";
            }
        }

        if (step === "media") {
            if (form.images.length === 0) {
                nextErrors.images =
                    "Add at least one property photo.";
            } else if (form.images.length > maxImages) {
                nextErrors.images = `Your ${currentPlan.presentation.displayName} plan allows up to ${maxImages} images.`;
            }

            const videoLinks = form.videoLinks
                .map((link) => link.trim())
                .filter(Boolean);

            if (videoLinks.length > maxVideoLinks) {
                nextErrors.videoLinks = `Your ${currentPlan.presentation.displayName} plan allows up to ${maxVideoLinks} video links.`;
            } else if (
                videoLinks.some((link) => !isValidVideoUrl(link))
            ) {
                nextErrors.videoLinks =
                    "Only YouTube and Vimeo links are allowed.";
            }
        }

        setErrors(nextErrors);

        return Object.keys(nextErrors).length === 0;
    }

    function validateAll(): StepId | null {
        const order: StepId[] = [
            "category",
            "location",
            "details",
            "pricing",
            "media",
        ];

        return (
            order.find((step) => !validateStep(step)) ??
            null
        );
    }

    function goForward() {
        if (
            activeStep !== "review" &&
            !validateStep(activeStep)
        ) {
            return;
        }

        setErrors({});
        setActiveStep(
            STEPS[
                Math.min(
                    activeStepIndex + 1,
                    STEPS.length - 1,
                )
                ].id,
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function goBack() {
        setErrors({});
        setActiveStep(
            STEPS[Math.max(activeStepIndex - 1, 0)].id,
        );
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function deleteDraftUploads(
        urls: string[],
    ): Promise<boolean> {
        const files = urls
            .map((url) => {
                const grant =
                    form.uploadDeleteGrants[url];

                if (!grant) {
                    return null;
                }

                return {
                    url,
                    fileKey: grant.fileKey,
                    deleteToken:
                    grant.deleteToken,
                };
            })
            .filter(
                (
                    value,
                ): value is {
                    url: string;
                    fileKey: string;
                    deleteToken: string;
                } => Boolean(value),
            );

        if (files.length === 0) {
            return true;
        }

        try {
            const response = await fetch(
                "/api/uploadthing/delete",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        files,
                    }),
                },
            );

            const payload: unknown =
                await response.json();

            if (!response.ok) {
                const message =
                    typeof payload ===
                    "object" &&
                    payload !== null &&
                    "error" in payload &&
                    typeof payload.error ===
                    "string"
                        ? payload.error
                        : "Unable to remove the uploaded file.";

                throw new Error(message);
            }

            return true;
        } catch (error) {
            setUploadMessage(
                error instanceof Error
                    ? error.message
                    : "Unable to remove the uploaded file.",
            );

            return false;
        }
    }

    async function removeDraftImage(
        imageUrl: string,
    ) {
        const deleted =
            await deleteDraftUploads([
                imageUrl,
            ]);

        if (!deleted) {
            return;
        }

        setForm((current) => {
            const nextGrants = {
                ...current.uploadDeleteGrants,
            };
            delete nextGrants[imageUrl];

            return {
                ...current,
                images:
                    current.images.filter(
                        (url) =>
                            url !== imageUrl,
                    ),
                uploadDeleteGrants:
                nextGrants,
            };
        });

        setUploadMessage(
            "Image removed.",
        );
    }

    async function removeDraftBrochure() {
        const brochureUrl =
            form.brochure?.url;

        if (!brochureUrl) {
            return;
        }

        const deleted =
            await deleteDraftUploads([
                brochureUrl,
            ]);

        if (!deleted) {
            return;
        }

        setForm((current) => {
            const nextGrants = {
                ...current.uploadDeleteGrants,
            };
            delete nextGrants[
                brochureUrl
                ];

            return {
                ...current,
                brochure: null,
                uploadDeleteGrants:
                nextGrants,
            };
        });

        setUploadMessage(
            "Brochure removed.",
        );
    }

    async function clearDraft() {
        const uploadedUrls = Object.keys(
            form.uploadDeleteGrants,
        );

        const deleted =
            await deleteDraftUploads(
                uploadedUrls,
            );

        if (!deleted) {
            return;
        }

        localStorage.removeItem(
            FORM_STORAGE_KEY,
        );
        localStorage.removeItem(
            STEP_STORAGE_KEY,
        );
        setForm(DEFAULT_FORM);
        setActiveStep("category");
        setErrors({});
        setSubmitError("");
        setUploadMessage("");
    }

    function handleWizardSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        /*
         * Pressing Enter anywhere in the wizard must never publish a listing.
         * Before the review step it only advances after validating the current
         * section. On the review step it does nothing; publishing is handled by
         * the explicit button below.
         */
        if (activeStep !== "review") {
            goForward();
        }
    }

    async function publishProperty() {
        if (activeStep !== "review" || submitting) {
            return;
        }

        const invalidStep = validateAll();

        if (invalidStep) {
            setActiveStep(invalidStep);
            return;
        }

        setSubmitting(true);
        setSubmitError("");

        try {
            const response = await fetch(
                "/api/property/create",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        purpose: form.purpose,
                        propertyType: form.propertyType,
                        commercialType:
                            form.category === "commercial"
                                ? form.commercialType
                                : null,
                        description: form.description.trim(),
                        address: form.address.trim(),
                        locality: form.locality,
                        city: form.city,
                        state: "Tamil Nadu",
                        landmark: form.landmark.trim(),

                        developerName:
                            form.developerName.trim(),

                        uds: optionalNumber(form.uds),

                        size: Number(form.size),

                        sizeUnit:
                        form.sizeUnit,

                        unitConfigurations:
                            form.unitConfigurations.map(
                                (configuration) => ({
                                    bedrooms:
                                        Number(
                                            configuration.bedrooms,
                                        ),

                                    size:
                                        Number(
                                            configuration.size,
                                        ),

                                    sizeUnit:
                                    configuration.sizeUnit,

                                    price:
                                        Number(
                                            configuration.price,
                                        ),
                                }),
                            ),

                        dimensions:
                            form.dimensions.trim(),
                        ownershipType: form.ownershipType,
                        price: Number(form.price),
                        priceType: form.priceType,
                        negotiable: form.negotiable,
                        gstApplicable: form.gstApplicable,
                        registrationChargesAdditional:
                        form.registrationChargesAdditional,

                        zeroCommission:
                        form.zeroCommission,

                        bedrooms:
                            form.category === "residential"
                                ? optionalNumber(form.bedrooms)
                                : null,
                        bathrooms:
                            form.category === "land"
                                ? null
                                : optionalNumber(form.bathrooms),
                        floors:
                            form.category === "land"
                                ? null
                                : optionalNumber(form.floors),
                        amenities: form.amenities,
                        images: form.images,
                        videoLinks: form.videoLinks
                            .map((link) => link.trim())
                            .filter(Boolean),
                        brochure: form.brochure,
                    }),
                },
            );

            const payload: unknown = await response.json();

            if (!response.ok) {
                const message =
                    typeof payload === "object" &&
                    payload !== null &&
                    "error" in payload &&
                    typeof payload.error === "string"
                        ? payload.error
                        : "Unable to publish this property.";

                throw new Error(message);
            }

            if (
                typeof payload !== "object" ||
                payload === null ||
                !("property" in payload) ||
                typeof payload.property !== "object" ||
                payload.property === null ||
                !("_id" in payload.property)
            ) {
                throw new Error(
                    "The property was created, but the response was incomplete.",
                );
            }

            localStorage.removeItem(FORM_STORAGE_KEY);
            localStorage.removeItem(STEP_STORAGE_KEY);

            router.push(
                `/property/${String(payload.property._id)}`,
            );
            router.refresh();
        } catch (error) {
            setSubmitError(
                error instanceof Error
                    ? error.message
                    : "Unable to publish this property.",
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <ProtectedRoute>
            <main className="min-h-screen bg-[#f5f7f6] pb-20 pt-20 font-body text-slate-950">
                <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.16),_transparent_35%),linear-gradient(180deg,#f7fbfa_0%,#ffffff_100%)]">
                    <div className="mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-6 lg:px-8 lg:pb-14">
                        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h1 className="mt-5 max-w-4xl font-heading text-4xl font-black leading-[1.06] tracking-[-0.045em] text-slate-950 sm:text-5xl">
                                    Publish a property people
                                    <span className="block text-primary">
                    can understand and trust.
                  </span>
                                </h1>
                                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                                    Create residential, land or commercial
                                    listings with structured location, pricing,
                                    facilities and media.
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-500 shadow-sm">
                  <Save
                      size={15}
                      className="text-primary"
                      aria-hidden="true"
                  />
                    {draftSaved
                        ? "Draft saved"
                        : "Draft saves automatically"}
                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        void clearDraft()
                                    }
                                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-50"
                                >
                                    <Trash2 size={15} aria-hidden="true" />
                                    Clear draft
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:px-8 lg:py-12">
                    <aside className="lg:sticky lg:top-28">
                        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <div className="relative overflow-hidden bg-slate-950 p-5 text-white">
                                <div
                                    className="pointer-events-none absolute -right-14 -top-16 h-44 w-44 rounded-full bg-teal-500/20 blur-3xl"
                                    aria-hidden="true"
                                />
                                <div className="relative">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.14em] text-teal-300">
                                                Publishing plan
                                            </p>
                                            <h2 className="mt-2 text-xl font-black">
                                                {currentPlan.presentation.displayName}
                                            </h2>
                                        </div>
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                      <BadgeCheck size={18} aria-hidden="true" />
                    </span>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-2">
                                        <div className="rounded-xl bg-white/[0.06] p-3">
                                            <p className="text-lg font-black">{maxImages}</p>
                                            <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                                                Photos
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-white/[0.06] p-3">
                                            <p className="text-lg font-black">
                                                {maxVideoLinks}
                                            </p>
                                            <p className="mt-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                                                Videos
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <nav
                                aria-label="Property publishing steps"
                                className="space-y-1 p-3"
                            >
                                {STEPS.map((step, index) => {
                                    const Icon = step.icon;
                                    const active = step.id === activeStep;
                                    const complete = index < activeStepIndex;
                                    const available = index <= activeStepIndex;

                                    return (
                                        <button
                                            key={step.id}
                                            type="button"
                                            disabled={!available}
                                            onClick={() => {
                                                if (available) {
                                                    setErrors({});
                                                    setActiveStep(step.id);
                                                }
                                            }}
                                            className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                                                active
                                                    ? "bg-slate-950 text-white shadow-lg"
                                                    : complete
                                                        ? "bg-teal-50 text-primary"
                                                        : "text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                                            }`}
                                        >
                      <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              active
                                  ? "bg-white/10 text-teal-300"
                                  : complete
                                      ? "bg-white text-primary shadow-sm"
                                      : "bg-slate-50 text-slate-400"
                          }`}
                      >
                        {complete ? (
                            <Check size={17} aria-hidden="true" />
                        ) : (
                            <Icon size={17} aria-hidden="true" />
                        )}
                      </span>
                                            <span className="min-w-0 flex-1">
                        <span className="block text-xs font-black">
                          {step.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[9px] text-slate-400">
                          {step.description}
                        </span>
                      </span>
                                            <span className="text-[9px] font-black">
                        0{index + 1}
                      </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </aside>

                    <form onSubmit={handleWizardSubmit} className="min-w-0">
                        <div className="mb-4 overflow-x-auto lg:hidden">
                            <div className="flex min-w-max gap-2">
                                {STEPS.map((step, index) => {
                                    const Icon = step.icon;
                                    const active = step.id === activeStep;
                                    const complete = index < activeStepIndex;

                                    return (
                                        <button
                                            key={step.id}
                                            type="button"
                                            disabled={index > activeStepIndex}
                                            onClick={() => setActiveStep(step.id)}
                                            className={`inline-flex h-11 items-center gap-2 rounded-xl border px-3 text-xs font-black ${
                                                active
                                                    ? "border-primary bg-primary text-white"
                                                    : complete
                                                        ? "border-teal-200 bg-teal-50 text-primary"
                                                        : "border-slate-200 bg-white text-slate-400"
                                            }`}
                                        >
                                            {complete ? (
                                                <Check size={14} aria-hidden="true" />
                                            ) : (
                                                <Icon size={14} aria-hidden="true" />
                                            )}
                                            {step.shortTitle}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
                                <div className="flex items-center justify-between gap-4">
                                    <p className="text-xs font-black text-slate-600">
                                        Step {activeStepIndex + 1} of {STEPS.length}
                                    </p>
                                    <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200 sm:w-52">
                                        <div
                                            className="h-full rounded-full bg-primary transition-[width] duration-300"
                                            style={{
                                                width: `${
                                                    ((activeStepIndex + 1) /
                                                        STEPS.length) *
                                                    100
                                                }%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 sm:p-7 lg:p-8">
                                <AnimatePresence mode="wait">
                                    <motion.section
                                        key={activeStep}
                                        initial={{ opacity: 0, x: 14 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -14 }}
                                    >
                                        {activeStep === "category" ? (
                                            <div className="space-y-8">
                                                <SectionHeading
                                                    eyebrow="Listing type"
                                                    title="What kind of property are you publishing?"
                                                    description="Start with the broad category. Commercial listings then open a dedicated subtype selector."
                                                    icon={Building2}
                                                />

                                                <fieldset>
                                                    <legend className="text-sm font-black text-slate-950">
                                                        Property category
                                                    </legend>
                                                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                                                        {PROPERTY_CATEGORIES.map((category) => {
                                                            const Icon =
                                                                CATEGORY_ICONS[category.value];
                                                            const selected =
                                                                form.category === category.value;

                                                            return (
                                                                <button
                                                                    key={category.value}
                                                                    type="button"
                                                                    aria-pressed={selected}
                                                                    onClick={() =>
                                                                        selectCategory(category.value)
                                                                    }
                                                                    className={`relative overflow-hidden rounded-[1.5rem] border p-5 text-left transition ${
                                                                        selected
                                                                            ? "border-primary bg-teal-50 ring-2 ring-primary/10"
                                                                            : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"
                                                                    }`}
                                                                >
                                  <span
                                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                                          selected
                                              ? "bg-primary text-white"
                                              : "bg-slate-50 text-slate-500"
                                      }`}
                                  >
                                    <Icon size={22} aria-hidden="true" />
                                  </span>
                                                                    <h3 className="mt-5 font-black text-slate-950">
                                                                        {category.label}
                                                                    </h3>
                                                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                                                        {category.description}
                                                                    </p>
                                                                    {selected ? (
                                                                        <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                                      <Check size={14} aria-hidden="true" />
                                    </span>
                                                                    ) : null}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </fieldset>

                                                <fieldset className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                                                    <legend className="px-2 text-sm font-black text-slate-950">
                                                        What do you want to do?
                                                    </legend>
                                                    <div className="mt-2 grid gap-3 sm:grid-cols-3">
                                                        {applicablePurposes.map((purpose) => {
                                                            const selected =
                                                                form.purpose === purpose;

                                                            return (
                                                                <button
                                                                    key={purpose}
                                                                    type="button"
                                                                    aria-pressed={selected}
                                                                    onClick={() =>
                                                                        updateForm({ purpose })
                                                                    }
                                                                    className={`rounded-xl border p-4 text-left transition ${
                                                                        selected
                                                                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/15"
                                                                            : "border-slate-200 bg-white text-slate-700 hover:border-teal-200"
                                                                    }`}
                                                                >
                                  <span className="block text-sm font-black">
                                    {purpose}
                                  </span>
                                                                    <span
                                                                        className={`mt-1 block text-xs leading-5 ${
                                                                            selected
                                                                                ? "text-teal-50/80"
                                                                                : "text-slate-500"
                                                                        }`}
                                                                    >
                                    {purpose === "Sell"
                                        ? "Offer the property for sale."
                                        : purpose === "Rent"
                                            ? "Offer it for rent or lease."
                                            : "List shared or managed accommodation."}
                                  </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {errors.purpose ? (
                                                        <ErrorText>{errors.purpose}</ErrorText>
                                                    ) : null}
                                                </fieldset>

                                                {form.category === "residential" ? (
                                                    <div>
                                                        <h3 className="text-sm font-black text-slate-950">
                                                            Residential type
                                                        </h3>
                                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                            {RESIDENTIAL_PROPERTY_TYPES.map((type) => {
                                                                const Icon =
                                                                    PROPERTY_ICONS[type] ?? Home;
                                                                const selected =
                                                                    form.propertyType === type;

                                                                return (
                                                                    <button
                                                                        key={type}
                                                                        type="button"
                                                                        aria-pressed={selected}
                                                                        onClick={() =>
                                                                            updateForm({
                                                                                propertyType: type,
                                                                            })
                                                                        }
                                                                        className={`flex items-start gap-4 rounded-2xl border p-5 text-left transition ${
                                                                            selected
                                                                                ? "border-primary bg-teal-50 text-primary ring-2 ring-primary/10"
                                                                                : "border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"
                                                                        }`}
                                                                    >
                                    <span
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                                            selected
                                                ? "bg-primary text-white"
                                                : "bg-slate-50 text-slate-400"
                                        }`}
                                    >
                                      <Icon size={20} aria-hidden="true" />
                                    </span>

                                                                        <span className="min-w-0">
                                      <span className="block text-sm font-black">
                                        {type}
                                      </span>
                                      <span
                                          className={`mt-1 block text-xs leading-5 ${
                                              selected
                                                  ? "text-slate-600"
                                                  : "text-slate-500"
                                          }`}
                                      >
                                        {RESIDENTIAL_TYPE_DESCRIPTIONS[type]}
                                      </span>
                                    </span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {form.category === "land" ? (
                                                    <div>
                                                        <h3 className="text-sm font-black text-slate-950">
                                                            Land type
                                                        </h3>
                                                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                                            {LAND_PROPERTY_TYPES.map((type) => {
                                                                const Icon =
                                                                    PROPERTY_ICONS[type] ?? Map;
                                                                const selected =
                                                                    form.propertyType === type;

                                                                return (
                                                                    <button
                                                                        key={type}
                                                                        type="button"
                                                                        aria-pressed={selected}
                                                                        onClick={() =>
                                                                            updateForm({
                                                                                propertyType: type,
                                                                            })
                                                                        }
                                                                        className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${
                                                                            selected
                                                                                ? "border-primary bg-teal-50 text-primary ring-2 ring-primary/10"
                                                                                : "border-slate-200 bg-white text-slate-700 hover:border-teal-200"
                                                                        }`}
                                                                    >
                                    <span
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                                            selected
                                                ? "bg-primary text-white"
                                                : "bg-slate-50 text-slate-400"
                                        }`}
                                    >
                                      <Icon size={21} aria-hidden="true" />
                                    </span>
                                                                        <span>
                                      <span className="block font-black">
                                        {type}
                                      </span>
                                      <span className="mt-1 block text-xs text-slate-500">
                                        {type === "Plot"
                                            ? "Residential or development plot."
                                            : "Farm and agricultural land."}
                                      </span>
                                    </span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {form.category === "commercial" ? (
                                                    <div className="space-y-6">
                                                        <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                                <Building2 size={19} aria-hidden="true" />
                              </span>
                                                            <div>
                                                                <h3 className="font-black text-slate-950">
                                                                    Commercial property
                                                                </h3>
                                                                <p className="mt-1 text-xs leading-5 text-slate-600">
                                                                    The public category remains Commercial,
                                                                    while the subtype identifies the exact
                                                                    business space.
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {COMMERCIAL_TYPE_GROUPS.map((group) => (
                                                            <fieldset key={group.label}>
                                                                <legend className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
                                                                    {group.label}
                                                                </legend>
                                                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                                    {group.items.map((item) => {
                                                                        const Icon =
                                                                            COMMERCIAL_ICONS[item.value] ??
                                                                            Building2;
                                                                        const selected =
                                                                            form.commercialType === item.value;

                                                                        return (
                                                                            <button
                                                                                key={item.value}
                                                                                type="button"
                                                                                aria-pressed={selected}
                                                                                onClick={() =>
                                                                                    updateForm({
                                                                                        propertyType: "Commercial",
                                                                                        commercialType: item.value,
                                                                                    })
                                                                                }
                                                                                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                                                                                    selected
                                                                                        ? "border-primary bg-slate-950 text-white shadow-lg"
                                                                                        : "border-slate-200 bg-white text-slate-700 hover:border-teal-200 hover:bg-teal-50/40"
                                                                                }`}
                                                                            >
                                        <span
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                                selected
                                                    ? "bg-white/10 text-teal-300"
                                                    : "bg-slate-50 text-primary"
                                            }`}
                                        >
                                          <Icon
                                              size={19}
                                              aria-hidden="true"
                                          />
                                        </span>
                                                                                <span className="min-w-0">
                                          <span className="block text-sm font-black">
                                            {item.value}
                                          </span>
                                          <span
                                              className={`mt-1 block text-xs leading-5 ${
                                                  selected
                                                      ? "text-slate-400"
                                                      : "text-slate-500"
                                              }`}
                                          >
                                            {item.description}
                                          </span>
                                        </span>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </fieldset>
                                                        ))}

                                                        {errors.commercialType ? (
                                                            <ErrorText>
                                                                {errors.commercialType}
                                                            </ErrorText>
                                                        ) : null}
                                                    </div>
                                                ) : null}

                                                <label className="block">
                                                    <FieldLabel
                                                        hint={`${form.description.length}/2000`}
                                                    >
                                                        Property description
                                                    </FieldLabel>
                                                    <textarea
                                                        rows={6}
                                                        maxLength={2000}
                                                        value={form.description}
                                                        onChange={(event) =>
                                                            updateForm({
                                                                description: event.target.value,
                                                            })
                                                        }
                                                        placeholder={
                                                            isCommercial
                                                                ? "Describe access, frontage, fit-out, surrounding commercial activity and permitted use."
                                                                : "Describe the property, condition, nearby advantages and anything a buyer or renter should understand."
                                                        }
                                                        className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                    />
                                                </label>
                                            </div>
                                        ) : null}

                                        {activeStep === "location" ? (
                                            <div className="space-y-8">
                                                <SectionHeading
                                                    eyebrow="Location & area"
                                                    title="Make the property easy to locate"
                                                    description="Use structured Tamil Nadu city and locality data, then add the exact address and area."
                                                    icon={MapPin}
                                                />

                                                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:p-6">
                                                    <div className="grid gap-5 md:grid-cols-3">
                                                        <label>
                                                            <FieldLabel required>State</FieldLabel>
                                                            <SelectField
                                                                value="Tamil Nadu"
                                                                disabled
                                                                ariaLabel="State"
                                                                onChange={() => {}}
                                                            >
                                                                <option value="Tamil Nadu">
                                                                    Tamil Nadu
                                                                </option>
                                                            </SelectField>
                                                        </label>

                                                        <label>
                                                            <FieldLabel required>City</FieldLabel>
                                                            <SelectField
                                                                value={form.city}
                                                                ariaLabel="City"
                                                                onChange={(city) =>
                                                                    updateForm({
                                                                        city,
                                                                        locality: "",
                                                                    })
                                                                }
                                                            >
                                                                <option value="">Select city</option>
                                                                {TAMIL_NADU_CITIES.map((city) => (
                                                                    <option key={city} value={city}>
                                                                        {city}
                                                                    </option>
                                                                ))}
                                                            </SelectField>
                                                            {errors.city ? (
                                                                <ErrorText>{errors.city}</ErrorText>
                                                            ) : null}
                                                        </label>

                                                        <label>
                                                            <FieldLabel required>
                                                                Locality / area
                                                            </FieldLabel>
                                                            <SelectField
                                                                value={form.locality}
                                                                disabled={!form.city}
                                                                ariaLabel="Locality or area"
                                                                onChange={(locality) =>
                                                                    updateForm({ locality })
                                                                }
                                                            >
                                                                <option value="">
                                                                    {form.city
                                                                        ? "Select locality"
                                                                        : "Select city first"}
                                                                </option>
                                                                {localityOptions.map((locality) => (
                                                                    <option
                                                                        key={locality}
                                                                        value={locality}
                                                                    >
                                                                        {locality}
                                                                    </option>
                                                                ))}
                                                            </SelectField>
                                                            {errors.locality ? (
                                                                <ErrorText>
                                                                    {errors.locality}
                                                                </ErrorText>
                                                            ) : null}
                                                        </label>
                                                    </div>

                                                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                                        <label className="sm:col-span-2">
                                                            <FieldLabel required>
                                                                Street address / property name
                                                            </FieldLabel>
                                                            <input
                                                                value={form.address}
                                                                onChange={(event) =>
                                                                    updateForm({
                                                                        address: event.target.value,
                                                                    })
                                                                }
                                                                placeholder={
                                                                    isCommercial
                                                                        ? "Building name, unit or shop number and street"
                                                                        : "House number, street and property name"
                                                                }
                                                                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                            />
                                                            {errors.address ? (
                                                                <ErrorText>
                                                                    {errors.address}
                                                                </ErrorText>
                                                            ) : null}
                                                        </label>

                                                        <label>
                                                            <FieldLabel>Nearby landmark</FieldLabel>
                                                            <input
                                                                value={form.landmark}
                                                                onChange={(event) =>
                                                                    updateForm({
                                                                        landmark: event.target.value,
                                                                    })
                                                                }
                                                                placeholder="Optional"
                                                                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                            />
                                                        </label>

                                                        <label>
                                                            <FieldLabel>Ownership type</FieldLabel>
                                                            <SelectField
                                                                value={form.ownershipType}
                                                                ariaLabel="Ownership type"
                                                                onChange={(ownershipType) =>
                                                                    updateForm({ ownershipType })
                                                                }
                                                            >
                                                                {OWNERSHIP_TYPES.map((type) => (
                                                                    <option key={type} value={type}>
                                                                        {type}
                                                                    </option>
                                                                ))}
                                                            </SelectField>
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-primary">
                <Ruler size={19} aria-hidden="true" />
            </span>

                                                            <div>
                                                                <h3 className="font-black text-slate-950">
                                                                    Property area
                                                                </h3>

                                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                                    Enter the primary area or add multiple
                                                                    BHK configurations with different sizes
                                                                    and prices.
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {!isLand && !isCommercial ? (
                                                            <button
                                                                type="button"
                                                                onClick={addUnitConfiguration}
                                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 text-xs font-black text-primary transition hover:bg-primary/10"
                                                            >
                                                                <Plus size={15} aria-hidden="true" />
                                                                Add unit
                                                            </button>
                                                        ) : null}
                                                    </div>

                                                    <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                                                        <label className="lg:col-span-2">
                                                            <FieldLabel required>
                                                                {form.propertyType === "Apartment"
                                                                    ? "Built-up size"
                                                                    : isCommercial
                                                                        ? "Commercial area"
                                                                        : "Total size"}
                                                            </FieldLabel>

                                                            <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-2">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="any"
                                                                    value={form.size}
                                                                    onChange={(event) =>
                                                                        updateForm({
                                                                            size: event.target.value,
                                                                        })
                                                                    }
                                                                    placeholder="Enter size"
                                                                    className="h-12 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                                />

                                                                <SelectField
                                                                    value={form.sizeUnit}
                                                                    ariaLabel="Size unit"
                                                                    onChange={(sizeUnit) =>
                                                                        updateForm({ sizeUnit })
                                                                    }
                                                                >
                                                                    {SIZE_UNITS.map((unit) => (
                                                                        <option
                                                                            key={unit.value}
                                                                            value={unit.value}
                                                                        >
                                                                            {unit.label}
                                                                        </option>
                                                                    ))}
                                                                </SelectField>
                                                            </div>

                                                            {errors.size ? (
                                                                <ErrorText>{errors.size}</ErrorText>
                                                            ) : null}
                                                        </label>

                                                        <label>
                                                            <FieldLabel hint="Optional">
                                                                UDS
                                                            </FieldLabel>

                                                            <div className="relative">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    step="0.01"
                                                                    value={form.uds}
                                                                    onChange={(event) => {
                                                                        const value =
                                                                            event.target.value;

                                                                        if (
                                                                            value !== "" &&
                                                                            Number(value) > 100
                                                                        ) {
                                                                            return;
                                                                        }

                                                                        updateForm({
                                                                            uds: value,
                                                                        });
                                                                    }}
                                                                    placeholder="Optional"
                                                                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                                />

                                                                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                    %
                </span>
                                                            </div>

                                                            {errors.uds ? (
                                                                <ErrorText>{errors.uds}</ErrorText>
                                                            ) : null}
                                                        </label>

                                                        <label>
                                                            <FieldLabel
                                                                hint={
                                                                    isCommercial
                                                                        ? "frontage / layout"
                                                                        : "e.g. 40 × 60"
                                                                }
                                                            >
                                                                Dimensions
                                                            </FieldLabel>

                                                            <input
                                                                value={form.dimensions}
                                                                onChange={(event) =>
                                                                    updateForm({
                                                                        dimensions:
                                                                        event.target.value,
                                                                    })
                                                                }
                                                                placeholder="Optional"
                                                                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                            />
                                                        </label>
                                                    </div>

                                                    {!isLand &&
                                                    !isCommercial &&
                                                    form.unitConfigurations.length > 0 ? (
                                                        <div className="mt-6 border-t border-slate-100 pt-6">
                                                            <div className="mb-4">
                                                                <h4 className="text-sm font-black text-slate-950">
                                                                    Available unit configurations
                                                                </h4>

                                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                                    Add each BHK, built-up area and asking
                                                                    price offered within this project.
                                                                </p>
                                                            </div>

                                                            <div className="space-y-3">
                                                                {form.unitConfigurations.map(
                                                                    (configuration, index) => (
                                                                        <div
                                                                            key={configuration.id}
                                                                            className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
                                                                        >
                                                                            <div className="mb-4 flex items-center justify-between">
                                                                                <p className="text-xs font-black uppercase tracking-[0.1em] text-slate-500">
                                                                                    Unit {index + 1}
                                                                                </p>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        removeUnitConfiguration(
                                                                                            configuration.id,
                                                                                        )
                                                                                    }
                                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                                                    aria-label={`Remove unit ${index + 1}`}
                                                                                >
                                                                                    <Trash2 size={15} />
                                                                                </button>
                                                                            </div>

                                                                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[130px_minmax(0,1fr)_145px_minmax(0,1fr)]">
                                                                                <label>
                                                                                    <FieldLabel required>
                                                                                        BHK
                                                                                    </FieldLabel>

                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        max="20"
                                                                                        step="1"
                                                                                        value={
                                                                                            configuration.bedrooms
                                                                                        }
                                                                                        onChange={(event) =>
                                                                                            updateUnitConfiguration(
                                                                                                configuration.id,
                                                                                                "bedrooms",
                                                                                                event.target.value,
                                                                                            )
                                                                                        }
                                                                                        placeholder="2"
                                                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                                                    />
                                                                                </label>

                                                                                <label>
                                                                                    <FieldLabel required>
                                                                                        Built-up size
                                                                                    </FieldLabel>

                                                                                    <input
                                                                                        type="number"
                                                                                        min="0"
                                                                                        step="any"
                                                                                        value={
                                                                                            configuration.size
                                                                                        }
                                                                                        onChange={(event) =>
                                                                                            updateUnitConfiguration(
                                                                                                configuration.id,
                                                                                                "size",
                                                                                                event.target.value,
                                                                                            )
                                                                                        }
                                                                                        placeholder="978"
                                                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                                                    />
                                                                                </label>

                                                                                <label>
                                                                                    <FieldLabel>
                                                                                        Unit
                                                                                    </FieldLabel>

                                                                                    <SelectField
                                                                                        value={
                                                                                            configuration.sizeUnit
                                                                                        }
                                                                                        onChange={(value) =>
                                                                                            updateUnitConfiguration(
                                                                                                configuration.id,
                                                                                                "sizeUnit",
                                                                                                value,
                                                                                            )
                                                                                        }
                                                                                        ariaLabel={`Unit ${index + 1} area unit`}
                                                                                    >
                                                                                        {SIZE_UNITS.map(
                                                                                            (unit) => (
                                                                                                <option
                                                                                                    key={
                                                                                                        unit.value
                                                                                                    }
                                                                                                    value={
                                                                                                        unit.value
                                                                                                    }
                                                                                                >
                                                                                                    {
                                                                                                        unit.label
                                                                                                    }
                                                                                                </option>
                                                                                            ),
                                                                                        )}
                                                                                    </SelectField>
                                                                                </label>

                                                                                <label>
                                                                                    <FieldLabel required>
                                                                                        Price
                                                                                    </FieldLabel>

                                                                                    <div className="relative">
                                                                                        <IndianRupee
                                                                                            size={15}
                                                                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                                                                        />

                                                                                        <input
                                                                                            type="number"
                                                                                            min="1"
                                                                                            step="1"
                                                                                            value={
                                                                                                configuration.price
                                                                                            }
                                                                                            onChange={(event) =>
                                                                                                updateUnitConfiguration(
                                                                                                    configuration.id,
                                                                                                    "price",
                                                                                                    event.target.value,
                                                                                                )
                                                                                            }
                                                                                            placeholder="6500000"
                                                                                            className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-bold text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                                                        />
                                                                                    </div>
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>

                                                            {errors.unitConfigurations ? (
                                                                <ErrorText>
                                                                    {errors.unitConfigurations}
                                                                </ErrorText>
                                                            ) : null}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ) : null}

                                        {activeStep === "details" ? (
                                            <div className="space-y-8">
                                                <SectionHeading
                                                    eyebrow="Property details"
                                                    title={
                                                        isCommercial
                                                            ? "Add the business-space specifications"
                                                            : isLand
                                                                ? "Add the land specifications"
                                                                : "Add the residential specifications"
                                                    }
                                                    description={
                                                        isCommercial
                                                            ? "Commercial listings use washrooms, total floors and business facilities instead of bedroom fields."
                                                            : isLand
                                                                ? "Land listings focus on dimensions, ownership and access."
                                                                : "Add bedroom, bathroom and floor information buyers commonly compare."
                                                    }
                                                    icon={
                                                        isCommercial
                                                            ? Briefcase
                                                            : isLand
                                                                ? Map
                                                                : Home
                                                    }
                                                />

                                                {form.category === "residential" ? (
                                                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                        <div className="grid gap-5 sm:grid-cols-3">
                                                            {[
                                                                {
                                                                    key: "bedrooms",
                                                                    label:
                                                                        form.propertyType ===
                                                                        "Apartment"
                                                                            ? "BHK / bedrooms"
                                                                            : "Bedrooms",
                                                                    value: form.bedrooms,
                                                                },
                                                                {
                                                                    key: "bathrooms",
                                                                    label: "Bathrooms",
                                                                    value: form.bathrooms,
                                                                },
                                                                {
                                                                    key: "floors",
                                                                    label: "Total floors",
                                                                    value: form.floors,
                                                                },
                                                            ].map((field) => (
                                                                <label key={field.key}>
                                                                    <FieldLabel>{field.label}</FieldLabel>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={field.value}
                                                                        onChange={(event) =>
                                                                            updateForm({
                                                                                [field.key]:
                                                                                event.target.value,
                                                                            } as Partial<PropertyForm>)
                                                                        }
                                                                        placeholder="Optional"
                                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                                    />
                                                                    {errors[field.key] ? (
                                                                        <ErrorText>
                                                                            {errors[field.key]}
                                                                        </ErrorText>
                                                                    ) : null}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {form.category === "commercial" ? (
                                                    <div className="grid gap-6 lg:grid-cols-12">
                                                        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-7">
                                                            <div className="grid gap-5 sm:grid-cols-2">
                                                                <label>
                                                                    <FieldLabel>Washrooms</FieldLabel>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={form.bathrooms}
                                                                        onChange={(event) =>
                                                                            updateForm({
                                                                                bathrooms:
                                                                                event.target.value,
                                                                            })
                                                                        }
                                                                        placeholder="Optional"
                                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                                    />
                                                                    {errors.bathrooms ? (
                                                                        <ErrorText>
                                                                            {errors.bathrooms}
                                                                        </ErrorText>
                                                                    ) : null}
                                                                </label>

                                                                <label>
                                                                    <FieldLabel>Total floors</FieldLabel>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        value={form.floors}
                                                                        onChange={(event) =>
                                                                            updateForm({
                                                                                floors: event.target.value,
                                                                            })
                                                                        }
                                                                        placeholder="Optional"
                                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                                    />
                                                                    {errors.floors ? (
                                                                        <ErrorText>
                                                                            {errors.floors}
                                                                        </ErrorText>
                                                                    ) : null}
                                                                </label>
                                                            </div>

                                                            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                                  <Info size={18} aria-hidden="true" />
                                </span>
                                                                <p className="text-xs leading-6 text-slate-600">
                                                                    Parking, lifts, loading access,
                                                                    frontage, fire safety, signage and
                                                                    fit-out details are selected under
                                                                    commercial facilities in the next
                                                                    media step.
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_24px_65px_rgba(15,23,42,0.2)] lg:col-span-5">
                                                            <div
                                                                className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-500/20 blur-3xl"
                                                                aria-hidden="true"
                                                            />
                                                            <div className="relative">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-teal-300 ring-1 ring-white/10">
                                  <Building2
                                      size={20}
                                      aria-hidden="true"
                                  />
                                </span>
                                                                <p className="mt-7 text-[10px] font-black uppercase tracking-[0.14em] text-teal-300">
                                                                    Commercial subtype
                                                                </p>
                                                                <h3 className="mt-3 text-2xl font-black">
                                                                    {form.commercialType}
                                                                </h3>
                                                                <p className="mt-3 text-sm leading-6 text-slate-400">
                                                                    The facility choices shown next are
                                                                    tailored for offices, retail,
                                                                    hospitality, industrial and
                                                                    special-use spaces.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : null}

                                                {form.category === "land" ? (
                                                    <div className="flex items-start gap-4 rounded-[1.75rem] border border-teal-100 bg-teal-50 p-5">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                              <Map size={20} aria-hidden="true" />
                            </span>
                                                        <div>
                                                            <h3 className="font-black text-slate-950">
                                                                Land details are ready
                                                            </h3>
                                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                Size, dimensions, location and
                                                                ownership were captured in the
                                                                previous step. Continue to pricing or
                                                                return to add more description.
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : null}

                                        {activeStep === "pricing" ? (
                                            <div className="space-y-8">
                                                <SectionHeading
                                                    eyebrow="Pricing"
                                                    title="Set a clear asking price"
                                                    description="Choose whether the amount is total or per square foot and tell users if it can be negotiated."
                                                    icon={IndianRupee}
                                                />

                                                <div className="grid gap-6 lg:grid-cols-12">
                                                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-7">
                                                        <div className="grid gap-5 sm:grid-cols-2">
                                                            <label className="sm:col-span-2">
                                                                <FieldLabel required>
                                                                    Asking price
                                                                </FieldLabel>
                                                                <span className="relative block">
                                  <IndianRupee
                                      size={17}
                                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                      aria-hidden="true"
                                  />
                                  <input
                                      type="number"
                                      min="1"
                                      value={form.price}
                                      onChange={(event) =>
                                          updateForm({
                                              price: event.target.value,
                                          })
                                      }
                                      placeholder="Enter amount"
                                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                  />
                                </span>
                                                                {errors.price ? (
                                                                    <ErrorText>{errors.price}</ErrorText>
                                                                ) : null}
                                                            </label>

                                                            <label>
                                                                <FieldLabel>Price type</FieldLabel>
                                                                <SelectField
                                                                    value={form.priceType}
                                                                    ariaLabel="Price type"
                                                                    onChange={(priceType) =>
                                                                        updateForm({ priceType })
                                                                    }
                                                                >
                                                                    {PRICE_TYPES.map((type) => (
                                                                        <option key={type} value={type}>
                                                                            {type}
                                                                        </option>
                                                                    ))}
                                                                </SelectField>
                                                            </label>

                                                            <div>
                                                                <FieldLabel>Negotiability</FieldLabel>
                                                                <button
                                                                    type="button"
                                                                    aria-pressed={form.negotiable}
                                                                    onClick={() =>
                                                                        updateForm({
                                                                            negotiable: !form.negotiable,
                                                                        })
                                                                    }
                                                                    className={`flex h-12 w-full items-center justify-between rounded-xl border px-4 text-left transition ${
                                                                        form.negotiable
                                                                            ? "border-primary bg-teal-50"
                                                                            : "border-slate-200 bg-slate-50"
                                                                    }`}
                                                                >
                                  <span className="text-sm font-black text-slate-950">
                                    {form.negotiable
                                        ? "Negotiable"
                                        : "Fixed price"}
                                  </span>
                                                                    <span
                                                                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                                                            form.negotiable
                                                                                ? "border-primary bg-primary text-white"
                                                                                : "border-slate-300 bg-white text-transparent"
                                                                        }`}
                                                                    >
                                    <Check size={13} aria-hidden="true" />
                                  </span>
                                                                </button>
                                                            </div>

                                                            <div className="sm:col-span-2">
                                                                <FieldLabel>
                                                                    Additional charges
                                                                </FieldLabel>

                                                                <p className="mb-4 text-xs leading-5 text-slate-500">
                                                                    Let buyers know which charges apply in addition to the
                                                                    listed asking price.
                                                                </p>

                                                                <div className="grid gap-3 sm:grid-cols-2">
                                                                    <button
                                                                        type="button"
                                                                        aria-pressed={form.gstApplicable}
                                                                        onClick={() =>
                                                                            updateForm({
                                                                                gstApplicable:
                                                                                    !form.gstApplicable,
                                                                            })
                                                                        }
                                                                        className={`relative rounded-2xl border p-4 text-left transition ${
                                                                            form.gstApplicable
                                                                                ? "border-primary bg-teal-50 ring-2 ring-primary/10"
                                                                                : "border-slate-200 bg-white hover:border-teal-300"
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start justify-between gap-3">
                                                                            <div>
                                                                                <p className="text-sm font-black text-slate-950">
                                                                                    GST applicable
                                                                                </p>

                                                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                                                    GST is charged in addition to the listed price.
                                                                                </p>
                                                                            </div>

                                                                            <span
                                                                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                                                                    form.gstApplicable
                                                                                        ? "border-primary bg-primary text-white"
                                                                                        : "border-slate-300 bg-white text-transparent"
                                                                                }`}
                                                                            >
                    <Check
                        size={13}
                        aria-hidden="true"
                    />
                </span>
                                                                        </div>
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        aria-pressed={
                                                                            form.registrationChargesAdditional
                                                                        }
                                                                        onClick={() =>
                                                                            updateForm({
                                                                                registrationChargesAdditional:
                                                                                    !form.registrationChargesAdditional,
                                                                            })
                                                                        }
                                                                        className={`relative rounded-2xl border p-4 text-left transition ${
                                                                            form.registrationChargesAdditional
                                                                                ? "border-primary bg-teal-50 ring-2 ring-primary/10"
                                                                                : "border-slate-200 bg-white hover:border-teal-300"
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start justify-between gap-3">
                                                                            <div>
                                                                                <p className="text-sm font-black text-slate-950">
                                                                                    Govt. registration charges additional
                                                                                </p>

                                                                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                                                                    Government registration and statutory charges
                                                                                    are payable separately.
                                                                                </p>
                                                                            </div>

                                                                            <span
                                                                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                                                                                    form.registrationChargesAdditional
                                                                                        ? "border-primary bg-primary text-white"
                                                                                        : "border-slate-300 bg-white text-transparent"
                                                                                }`}
                                                                            >
                    <Check
                        size={13}
                        aria-hidden="true"
                    />
                </span>
                                                                        </div>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="sm:col-span-2">
                                                                <FieldLabel>
                                                                    Commission preference
                                                                </FieldLabel>

                                                                <button
                                                                    type="button"
                                                                    aria-pressed={form.zeroCommission}
                                                                    onClick={() =>
                                                                        updateForm({
                                                                            zeroCommission:
                                                                                !form.zeroCommission,
                                                                        })
                                                                    }
                                                                    className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-primary/40 hover:bg-teal-50/30"
                                                                >
        <span
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                form.zeroCommission
                    ? "border-primary bg-primary text-white"
                    : "border-slate-300 bg-white text-transparent"
            }`}
        >
            <Check
                size={13}
                strokeWidth={3}
                aria-hidden="true"
            />
        </span>

                                                                    <span>
            <span className="block text-sm font-black text-slate-950">
                Zero Commission
            </span>

            <span className="mt-1 block text-xs leading-5 text-slate-500">
                Check this if no agent or
                brokerage commission applies
                to this property.
            </span>
        </span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="relative overflow-hidden rounded-[1.75rem] bg-primary p-6 text-white shadow-[0_24px_65px_rgba(13,148,136,0.2)] lg:col-span-5">
                                                        <div
                                                            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl"
                                                            aria-hidden="true"
                                                        />
                                                        <div className="relative">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-100">
                                                                Public price preview
                                                            </p>
                                                            <p className="mt-4 text-4xl font-black tracking-tight">
                                                                {formatPrice(form.price)}
                                                            </p>
                                                            <p className="mt-2 text-sm text-teal-50/80">
                                                                {form.priceType}
                                                                {form.negotiable
                                                                    ? " · Negotiable"
                                                                    : " · Fixed"}
                                                            </p>
                                                            {form.gstApplicable ||
                                                            form.registrationChargesAdditional ? (
                                                                <div className="mt-4 space-y-1.5 text-xs font-bold text-teal-50/90">
                                                                    {form.gstApplicable ? (
                                                                        <p>GST applicable</p>
                                                                    ) : null}

                                                                    {form.registrationChargesAdditional ? (
                                                                        <p>
                                                                            Govt. registration charges additional
                                                                        </p>
                                                                    ) : null}
                                                                </div>
                                                            ) : null}
                                                            <div className="mt-7 rounded-xl border border-white/15 bg-white/10 p-4 text-xs leading-6 text-teal-50/85">
                                                                Compare the amount with similar
                                                                properties in the same locality
                                                                before publishing.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}

                                        {activeStep === "media" ? (
                                            <div className="space-y-8">
                                                <SectionHeading
                                                    eyebrow="Facilities & media"
                                                    title={
                                                        isCommercial
                                                            ? "Show how the business space works"
                                                            : "Show what the property includes"
                                                    }
                                                    description={
                                                        isCommercial
                                                            ? "Commercial facilities cover access, logistics, visibility, business infrastructure and compliance."
                                                            : "Select genuine facilities, then add clear photos and eligible media."
                                                    }
                                                    icon={ImageIcon}
                                                />

                                                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <h3 className="font-black text-slate-950">
                                                                {isCommercial
                                                                    ? "Commercial facilities"
                                                                    : "Amenities"}
                                                            </h3>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {form.amenities.length} selected
                                                            </p>
                                                        </div>
                                                        {form.amenities.length > 0 ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateForm({ amenities: [] })
                                                                }
                                                                className="text-xs font-black text-red-600"
                                                            >
                                                                Clear all
                                                            </button>
                                                        ) : null}
                                                    </div>

                                                    <div className="mt-6 space-y-8">
                                                        {amenityCategories.map((category) => (
                                                            <fieldset key={category.name}>
                                                                <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                                    {category.name}
                                                                </legend>
                                                                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                                    {category.amenities.map((amenity) => {
                                                                        const selected =
                                                                            form.amenities.includes(
                                                                                amenity,
                                                                            );

                                                                        return (
                                                                            <button
                                                                                key={amenity}
                                                                                type="button"
                                                                                aria-pressed={selected}
                                                                                onClick={() =>
                                                                                    updateForm({
                                                                                        amenities: selected
                                                                                            ? form.amenities.filter(
                                                                                                (value) =>
                                                                                                    value !==
                                                                                                    amenity,
                                                                                            )
                                                                                            : [
                                                                                                ...form.amenities,
                                                                                                amenity,
                                                                                            ],
                                                                                    })
                                                                                }
                                                                                className={`flex min-h-14 items-center gap-3 rounded-xl border p-3 text-left text-xs font-bold transition ${
                                                                                    selected
                                                                                        ? "border-primary bg-primary text-white shadow-md shadow-primary/15"
                                                                                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-teal-200 hover:bg-white"
                                                                                }`}
                                                                            >
                                        <span
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                                                selected
                                                    ? "bg-white/15"
                                                    : "bg-white text-transparent shadow-sm"
                                            }`}
                                        >
                                          <Check
                                              size={12}
                                              aria-hidden="true"
                                          />
                                        </span>
                                                                                {amenity}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </fieldset>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-black text-slate-950">
                                                                Property photos
                                                            </h3>
                                                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                                                Add at least one. The first image is
                                                                the public cover.
                                                            </p>
                                                        </div>
                                                        <span className="rounded-full bg-teal-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-primary">
                              {form.images.length}/{maxImages} photos
                            </span>
                                                    </div>

                                                    {uploadMessage ? (
                                                        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-600">
                                                            {uploadMessage}
                                                        </p>
                                                    ) : null}

                                                    {form.images.length < maxImages ? (
                                                        <div className="mt-5 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                                                            <UploadDropzone
                                                                endpoint="propertyImageUploader"
                                                                config={{ mode: "auto" }}
                                                                onUploadBegin={() =>
                                                                    setUploadMessage(
                                                                        "Uploading image...",
                                                                    )
                                                                }
                                                                onClientUploadComplete={(result) => {
                                                                    const descriptors = (
                                                                        (result ?? []) as UploadFile[]
                                                                    )
                                                                        .map(
                                                                            getUploadedFileDescriptor,
                                                                        )
                                                                        .filter(
                                                                            (
                                                                                value,
                                                                            ): value is UploadedFileDescriptor =>
                                                                                Boolean(value),
                                                                        );

                                                                    if (
                                                                        descriptors.length === 0
                                                                    ) {
                                                                        setUploadMessage(
                                                                            "Upload finished, but no image URL was returned.",
                                                                        );
                                                                        return;
                                                                    }

                                                                    const remaining =
                                                                        Math.max(
                                                                            maxImages -
                                                                            form.images.length,
                                                                            0,
                                                                        );
                                                                    const accepted =
                                                                        descriptors.slice(
                                                                            0,
                                                                            remaining,
                                                                        );
                                                                    const overflow =
                                                                        descriptors.slice(
                                                                            remaining,
                                                                        );

                                                                    setForm((current) => {
                                                                        const nextGrants = {
                                                                            ...current.uploadDeleteGrants,
                                                                        };

                                                                        for (const file of accepted) {
                                                                            if (
                                                                                file.fileKey &&
                                                                                file.deleteToken
                                                                            ) {
                                                                                nextGrants[
                                                                                    file.url
                                                                                    ] = {
                                                                                    fileKey:
                                                                                    file.fileKey,
                                                                                    deleteToken:
                                                                                    file.deleteToken,
                                                                                };
                                                                            }
                                                                        }

                                                                        return {
                                                                            ...current,
                                                                            images: [
                                                                                ...current.images,
                                                                                ...accepted.map(
                                                                                    (file) =>
                                                                                        file.url,
                                                                                ),
                                                                            ],
                                                                            uploadDeleteGrants:
                                                                            nextGrants,
                                                                        };
                                                                    });

                                                                    if (
                                                                        overflow.length > 0
                                                                    ) {
                                                                        const overflowFiles =
                                                                            overflow
                                                                                .filter(
                                                                                    (file) =>
                                                                                        file.fileKey &&
                                                                                        file.deleteToken,
                                                                                )
                                                                                .map(
                                                                                    (file) => ({
                                                                                        url: file.url,
                                                                                        fileKey:
                                                                                            file.fileKey as string,
                                                                                        deleteToken:
                                                                                            file.deleteToken as string,
                                                                                    }),
                                                                                );

                                                                        if (
                                                                            overflowFiles.length > 0
                                                                        ) {
                                                                            void fetch(
                                                                                "/api/uploadthing/delete",
                                                                                {
                                                                                    method:
                                                                                        "POST",
                                                                                    credentials:
                                                                                        "include",
                                                                                    headers: {
                                                                                        "Content-Type":
                                                                                            "application/json",
                                                                                    },
                                                                                    body: JSON.stringify(
                                                                                        {
                                                                                            files:
                                                                                            overflowFiles,
                                                                                        },
                                                                                    ),
                                                                                },
                                                                            );
                                                                        }
                                                                    }

                                                                    setUploadMessage(
                                                                        accepted.length > 0
                                                                            ? "Images uploaded successfully."
                                                                            : "The plan image limit has already been reached.",
                                                                    );
                                                                }}
                                                                onUploadError={(error: Error) =>
                                                                    setUploadMessage(
                                                                        error.message ||
                                                                        "Image upload failed.",
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm font-bold text-slate-600">
                                                            You have reached the image limit for
                                                            the{" "}
                                                            {
                                                                currentPlan.presentation
                                                                    .displayName
                                                            }{" "}
                                                            plan.
                                                        </div>
                                                    )}

                                                    {errors.images ? (
                                                        <ErrorText>{errors.images}</ErrorText>
                                                    ) : null}

                                                    {form.images.length > 0 ? (
                                                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                            {form.images.map(
                                                                (imageUrl, index) => (
                                                                    <div
                                                                        key={`${imageUrl}-${index}`}
                                                                        className={`group relative overflow-hidden rounded-2xl border bg-slate-100 ${
                                                                            index === 0
                                                                                ? "border-primary ring-2 ring-primary/10"
                                                                                : "border-slate-200"
                                                                        }`}
                                                                    >
                                                                        <img
                                                                            src={imageUrl}
                                                                            alt={`Property image ${
                                                                                index + 1
                                                                            }`}
                                                                            className="h-44 w-full object-cover"
                                                                        />
                                                                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/90 to-transparent p-3 pt-12">
                                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-950">
                                        {index === 0
                                            ? "Cover"
                                            : `Photo ${index + 1}`}
                                      </span>
                                                                            <div className="flex gap-2">
                                                                                {index > 0 ? (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            updateForm({
                                                                                                images: [
                                                                                                    imageUrl,
                                                                                                    ...form.images.filter(
                                                                                                        (
                                                                                                            _,
                                                                                                            itemIndex,
                                                                                                        ) =>
                                                                                                            itemIndex !==
                                                                                                            index,
                                                                                                    ),
                                                                                                ],
                                                                                            })
                                                                                        }
                                                                                        className="rounded-lg bg-white/90 px-2.5 py-1.5 text-[9px] font-black text-primary"
                                                                                    >
                                                                                        Make cover
                                                                                    </button>
                                                                                ) : null}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        void removeDraftImage(
                                                                                            imageUrl,
                                                                                        )
                                                                                    }
                                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white"
                                                                                    aria-label={`Remove image ${
                                                                                        index + 1
                                                                                    }`}
                                                                                >
                                                                                    <Trash2
                                                                                        size={14}
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </div>

                                                <div className="grid gap-6 lg:grid-cols-2">
                                                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <h3 className="text-lg font-black text-slate-950">
                                                                    Video links
                                                                </h3>
                                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                                    YouTube or Vimeo only.
                                                                </p>
                                                            </div>
                                                            <span className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                {form.videoLinks.length}/
                                                                {maxVideoLinks}
                              </span>
                                                        </div>

                                                        {maxVideoLinks > 0 ? (
                                                            <div className="mt-5 space-y-3">
                                                                {form.videoLinks.map(
                                                                    (link, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="grid grid-cols-[minmax(0,1fr)_44px] gap-2"
                                                                        >
                                      <span className="relative block">
                                        <Video
                                            size={16}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                            aria-hidden="true"
                                        />
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(event) =>
                                                updateForm({
                                                    videoLinks:
                                                        form.videoLinks.map(
                                                            (
                                                                value,
                                                                itemIndex,
                                                            ) =>
                                                                itemIndex ===
                                                                index
                                                                    ? event.target
                                                                        .value
                                                                    : value,
                                                        ),
                                                })
                                            }
                                            placeholder="YouTube or Vimeo URL"
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                        />
                                      </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    updateForm({
                                                                                        videoLinks:
                                                                                            form.videoLinks.filter(
                                                                                                (
                                                                                                    _,
                                                                                                    itemIndex,
                                                                                                ) =>
                                                                                                    itemIndex !== index,
                                                                                            ),
                                                                                    })
                                                                                }
                                                                                className="flex h-12 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600"
                                                                                aria-label={`Remove video link ${
                                                                                    index + 1
                                                                                }`}
                                                                            >
                                                                                <Trash2
                                                                                    size={15}
                                                                                    aria-hidden="true"
                                                                                />
                                                                            </button>
                                                                        </div>
                                                                    ),
                                                                )}

                                                                {form.videoLinks.length <
                                                                maxVideoLinks ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateForm({
                                                                                videoLinks: [
                                                                                    ...form.videoLinks,
                                                                                    "",
                                                                                ],
                                                                            })
                                                                        }
                                                                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                                                    >
                                                                        <Plus size={15} aria-hidden="true" />
                                                                        Add video link
                                                                    </button>
                                                                ) : null}
                                                            </div>
                                                        ) : (
                                                            <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                                                                Video links are not included in this
                                                                plan.
                                                            </div>
                                                        )}

                                                        {errors.videoLinks ? (
                                                            <ErrorText>
                                                                {errors.videoLinks}
                                                            </ErrorText>
                                                        ) : null}
                                                    </div>

                                                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                        <h3 className="text-lg font-black text-slate-950">
                                                            Property brochure
                                                        </h3>
                                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                                            PDF brochure for builder or developer
                                                            accounts.
                                                        </p>

                                                        {form.brochure ? (
                                                            <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                                                                <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                <FileText
                    size={18}
                    aria-hidden="true"
                />
            </span>

                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate text-sm font-black text-slate-950">
                                                                            {form.brochure.fileName}
                                                                        </p>

                                                                        <a
                                                                            href={form.brochure.url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="mt-1 inline-flex text-xs font-black text-primary"
                                                                        >
                                                                            Open PDF
                                                                        </a>
                                                                    </div>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            void removeDraftBrochure()
                                                                        }
                                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600"
                                                                        aria-label="Remove brochure"
                                                                    >
                                                                        <Trash2
                                                                            size={15}
                                                                            aria-hidden="true"
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="mt-5 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                                                                <UploadDropzone
                                                                    endpoint="developerBrochureUploader"
                                                                    config={{ mode: "auto" }}
                                                                    onUploadBegin={() =>
                                                                        setUploadMessage(
                                                                            "Uploading brochure...",
                                                                        )
                                                                    }
                                                                    onClientUploadComplete={(result) => {
                                                                        const file = (result ?? [])[0] as
                                                                            | UploadFile
                                                                            | undefined;

                                                                        const descriptor = file
                                                                            ? getUploadedFileDescriptor(file)
                                                                            : null;

                                                                        if (!descriptor) {
                                                                            setUploadMessage(
                                                                                "Upload completed, but no brochure URL was returned.",
                                                                            );
                                                                            return;
                                                                        }

                                                                        setForm((current) => {
                                                                            const nextGrants = {
                                                                                ...current.uploadDeleteGrants,
                                                                            };

                                                                            if (
                                                                                descriptor.fileKey &&
                                                                                descriptor.deleteToken
                                                                            ) {
                                                                                nextGrants[descriptor.url] = {
                                                                                    fileKey:
                                                                                    descriptor.fileKey,
                                                                                    deleteToken:
                                                                                    descriptor.deleteToken,
                                                                                };
                                                                            }

                                                                            return {
                                                                                ...current,
                                                                                brochure: {
                                                                                    url: descriptor.url,
                                                                                    fileName:
                                                                                        descriptor.fileName ||
                                                                                        "Property brochure.pdf",
                                                                                },
                                                                                uploadDeleteGrants:
                                                                                nextGrants,
                                                                            };
                                                                        });

                                                                        setUploadMessage(
                                                                            "Brochure uploaded successfully.",
                                                                        );
                                                                    }}
                                                                    onUploadError={(error: Error) =>
                                                                        setUploadMessage(
                                                                            error.message ||
                                                                            "Brochure upload failed.",
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}

                                        {activeStep === "review" ? (
                                            <div className="space-y-8">
                                                <SectionHeading
                                                    eyebrow="Review & publish"
                                                    title="Check the complete listing"
                                                    description="Confirm that the property type, location, price and media are accurate before publishing."
                                                    icon={BadgeCheck}
                                                />

                                                <div className="grid gap-6 lg:grid-cols-12">
                                                    <div className="space-y-6 lg:col-span-7">
                                                        <ReviewCard
                                                            title="Property"
                                                            onEdit={() =>
                                                                setActiveStep("category")
                                                            }
                                                        >
                                                            <ReviewRow
                                                                label="Purpose"
                                                                value={form.purpose}
                                                            />
                                                            <ReviewRow
                                                                label="Category"
                                                                value={
                                                                    form.category
                                                                        .charAt(0)
                                                                        .toUpperCase() +
                                                                    form.category.slice(1)
                                                                }
                                                            />
                                                            <ReviewRow
                                                                label="Property type"
                                                                value={displayType}
                                                            />
                                                            <ReviewRow
                                                                label="Description"
                                                                value={
                                                                    form.description ||
                                                                    "No description provided"
                                                                }
                                                            />
                                                        </ReviewCard>

                                                        <ReviewCard
                                                            title="Location & area"
                                                            onEdit={() =>
                                                                setActiveStep("location")
                                                            }
                                                        >
                                                            <ReviewRow
                                                                label="Address"
                                                                value={`${form.address}, ${form.locality}, ${form.city}, Tamil Nadu`}
                                                            />
                                                            <ReviewRow
                                                                label="Developer / Builder"
                                                                value={
                                                                    form.developerName ||
                                                                    "Not provided"
                                                                }
                                                            />
                                                            <ReviewRow
                                                                label="Landmark"
                                                                value={
                                                                    form.landmark ||
                                                                    "Not provided"
                                                                }
                                                            />
                                                            <ReviewRow
                                                                label="Area"
                                                                value={`${form.size} ${form.sizeUnit}`}
                                                            />
                                                            <ReviewRow
                                                                label="UDS"
                                                                value={
                                                                    form.uds
                                                                        ? `${form.uds}%`
                                                                        : "Not provided"
                                                                }
                                                            />
                                                            {form.unitConfigurations.length > 0 ? (
                                                                <ReviewRow
                                                                    label="Unit configurations"
                                                                    value={form.unitConfigurations
                                                                        .map(
                                                                            (configuration, index) =>
                                                                                `Unit ${index + 1}: ${configuration.bedrooms} BHK · ${configuration.size} ${configuration.sizeUnit} · ${formatPrice(configuration.price)}`,
                                                                        )
                                                                        .join("\n")}
                                                                />
                                                            ) : null}
                                                            <ReviewRow
                                                                label="Ownership"
                                                                value={form.ownershipType}
                                                            />
                                                        </ReviewCard>

                                                        <ReviewCard
                                                            title="Pricing & details"
                                                            onEdit={() =>
                                                                setActiveStep("pricing")
                                                            }
                                                        >
                                                            <ReviewRow
                                                                label="Price"
                                                                value={`${formatPrice(
                                                                    form.price,
                                                                )} · ${form.priceType}`}
                                                            />
                                                            <ReviewRow
                                                                label="Negotiability"
                                                                value={
                                                                    form.negotiable
                                                                        ? "Negotiable"
                                                                        : "Fixed price"
                                                                }
                                                            />
                                                            <ReviewRow
                                                                label="GST"
                                                                value={
                                                                    form.gstApplicable
                                                                        ? "Applicable"
                                                                        : "Not applicable"
                                                                }
                                                            />

                                                            <ReviewRow
                                                                label="Govt. registration charges"
                                                                value={
                                                                    form.registrationChargesAdditional
                                                                        ? "Additional"
                                                                        : "Included / not marked additional"
                                                                }
                                                            />
                                                            {form.category ===
                                                            "residential" ? (
                                                                <ReviewRow
                                                                    label="Residential specifications"
                                                                    value={`${
                                                                        form.bedrooms || "—"
                                                                    } beds · ${
                                                                        form.bathrooms || "—"
                                                                    } baths · ${
                                                                        form.floors || "—"
                                                                    } floors`}
                                                                />
                                                            ) : null}
                                                            {form.category ===
                                                            "commercial" ? (
                                                                <ReviewRow
                                                                    label="Commercial specifications"
                                                                    value={`${
                                                                        form.bathrooms || "—"
                                                                    } washrooms · ${
                                                                        form.floors || "—"
                                                                    } floors`}
                                                                />
                                                            ) : null}
                                                        </ReviewCard>
                                                    </div>

                                                    <div className="space-y-6 lg:col-span-5">
                                                        <ReviewCard
                                                            title="Facilities & media"
                                                            onEdit={() =>
                                                                setActiveStep("media")
                                                            }
                                                        >
                                                            <ReviewRow
                                                                label="Facilities"
                                                                value={`${form.amenities.length} selected`}
                                                            />
                                                            <ReviewRow
                                                                label="Photos"
                                                                value={`${form.images.length}/${maxImages}`}
                                                            />
                                                            <ReviewRow
                                                                label="Video links"
                                                                value={`${
                                                                    form.videoLinks.filter(Boolean)
                                                                        .length
                                                                }/${maxVideoLinks}`}
                                                            />
                                                            <ReviewRow
                                                                label="Brochure"
                                                                value={
                                                                    form.brochure?.fileName ||
                                                                    "Not uploaded"
                                                                }
                                                            />
                                                        </ReviewCard>

                                                        {form.images[0] ? (
                                                            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
                                                                <div className="relative">
                                                                    <img
                                                                        src={form.images[0]}
                                                                        alt="Property cover preview"
                                                                        className="h-56 w-full object-cover"
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                                                                    <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-slate-950">
                                    Cover preview
                                  </span>
                                                                </div>
                                                                <div className="p-5">
                                                                    <p className="text-xs font-bold text-primary">
                                                                        {form.locality}, {form.city}
                                                                    </p>
                                                                    <h3 className="mt-2 text-lg font-black text-slate-950">
                                                                        {displayType}
                                                                    </h3>
                                                                    <p className="mt-3 text-xl font-black text-slate-950">
                                                                        {formatPrice(form.price)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : null}

                                                        <div className="rounded-[1.75rem] border border-teal-100 bg-teal-50 p-5">
                                                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                                  <CircleCheckBig
                                      size={18}
                                      aria-hidden="true"
                                  />
                                </span>
                                                                <div>
                                                                    <h3 className="font-black text-slate-950">
                                                                        Ready to publish
                                                                    </h3>
                                                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                                                        The server will recheck plan
                                                                        capacity, media limits and
                                                                        commercial subtype validity before
                                                                        creating the listing.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                    </motion.section>
                                </AnimatePresence>

                                {submitError ? (
                                    <div className="mt-7 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
                                        <X
                                            size={18}
                                            className="mt-0.5 shrink-0"
                                            aria-hidden="true"
                                        />
                                        <p className="text-sm font-bold leading-6">
                                            {submitError}
                                        </p>
                                    </div>
                                ) : null}
                            </div>

                            <footer className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-7">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs leading-5 text-slate-500">
                                        {STEPS[activeStepIndex].description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 sm:flex">
                                        <button
                                            type="button"
                                            onClick={
                                                activeStepIndex === 0
                                                    ? () => router.push("/dashboard")
                                                    : goBack
                                            }
                                            disabled={submitting}
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary disabled:opacity-50"
                                        >
                                            {activeStepIndex === 0 ? (
                                                "Cancel"
                                            ) : (
                                                <>
                                                    <ArrowLeft
                                                        size={16}
                                                        aria-hidden="true"
                                                    />
                                                    Back
                                                </>
                                            )}
                                        </button>

                                        {activeStep === "review" ? (
                                            <button
                                                type="button"
                                                onClick={() => void publishProperty()}
                                                disabled={submitting}
                                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {submitting ? (
                                                    <Loader2
                                                        size={17}
                                                        className="animate-spin"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <Upload
                                                        size={17}
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                Publish property
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={goForward}
                                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-black text-white transition hover:bg-primary"
                                            >
                                                Continue
                                                <ArrowRight
                                                    size={16}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </footer>
                        </div>
                    </form>
                </div>
            </main>
        </ProtectedRoute>
    );
}
