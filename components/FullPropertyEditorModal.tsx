"use client";

import {
    FormEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    BadgeCheck,
    Building2,
    Check,
    ChevronDown,
    FileText,
    Image as ImageIcon,
    IndianRupee,
    Info,
    LayoutGrid,
    Loader2,
    MapPin,
    Plus,
    Ruler,
    Sparkles,
    Trash2,
    Upload,
    Video,
    X,
    type LucideIcon,
} from "lucide-react";

import { UploadDropzone } from "@/lib/uploadthing";
import {
    AMENITY_CATEGORIES,
    OWNERSHIP_TYPES,
    PRICE_TYPES,
    PROPERTY_PURPOSES,
    PROPERTY_TYPES,
    SIZE_UNITS,
    TAMIL_NADU_CITIES,
    getTamilNaduLocalities,
    isLandPropertyType,
} from "@/lib/property-form-options";
import type { PlanDefinition } from "@/lib/plan-catalog";

export interface PropertyEditorProperty {
    _id: string;
    purpose: string;
    propertyType: string;
    description?: string;
    address: string;
    locality?: string;
    city: string;
    state?: string;
    landmark?: string;
    developerName?: string;
    uds?: number | null;

    unitConfigurations?: Array<{
        _id?: string;
        bedrooms: number;
        size: number;
        sizeUnit: string;
        price: number;
    }>;

    size: number;
    sizeUnit?: string;
    dimensions?: string;
    ownershipType?: string;
    price: number;
    priceType?: string;
    negotiable?: boolean;
    bedrooms?: number | null;
    bathrooms?: number | null;
    floors?: number | null;
    amenities?: string[];
    images?: string[];
    videoLinks?: string[];
    brochure?: {
        url: string;
        fileName: string;
    } | null;
}

interface FullPropertyEditorModalProps {
    isOpen: boolean;
    property: PropertyEditorProperty | null;
    plan: PlanDefinition;
    onClose: () => void;
    onSaved: (
        property: PropertyEditorProperty,
    ) => void;
}

interface UploadDeleteGrant {
    fileKey: string;
    deleteToken: string;
}

interface EditorUploadFile {
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

interface EditorUploadedFileDescriptor {
    url: string;
    fileKey: string | null;
    deleteToken: string | null;
    fileName?: string;
}

interface UnitConfigurationForm {
    id: string;
    bedrooms: string;
    size: string;
    sizeUnit: string;
    price: string;
}

interface EditorForm {
    purpose: string;
    propertyType: string;
    description: string;
    address: string;
    locality: string;
    city: string;
    state: "Tamil Nadu";
    landmark: string;
    developerName: string;
    uds: string;
    unitConfigurations: UnitConfigurationForm[];
    size: string;
    sizeUnit: string;
    dimensions: string;
    ownershipType: string;
    price: string;
    priceType: string;
    negotiable: boolean;
    bedrooms: string;
    bathrooms: string;
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

type StepId =
    | "basics"
    | "location"
    | "pricing"
    | "amenities"
    | "media"
    | "review";

interface EditorStep {
    id: StepId;
    label: string;
    shortLabel: string;
    icon: LucideIcon;
}

const STEPS: EditorStep[] = [
    {
        id: "basics",
        label: "Property basics",
        shortLabel: "Basics",
        icon: Building2,
    },
    {
        id: "location",
        label: "Location & size",
        shortLabel: "Location",
        icon: MapPin,
    },
    {
        id: "pricing",
        label: "Pricing & specs",
        shortLabel: "Pricing",
        icon: IndianRupee,
    },
    {
        id: "amenities",
        label: "Amenities",
        shortLabel: "Amenities",
        icon: LayoutGrid,
    },
    {
        id: "media",
        label: "Photos & media",
        shortLabel: "Media",
        icon: ImageIcon,
    },
    {
        id: "review",
        label: "Review changes",
        shortLabel: "Review",
        icon: BadgeCheck,
    },
];

function createEditorForm(
    property: PropertyEditorProperty,
): EditorForm {
    return {
        purpose: property.purpose || "Sell",
        propertyType:
            property.propertyType ||
            "Independent House",
        description: property.description || "",
        address: property.address || "",
        locality: property.locality || "",
        city: property.city || "",
        state: "Tamil Nadu",
        landmark: property.landmark || "",

        developerName:
            property.developerName || "",

        uds:
            property.uds === null ||
            property.uds === undefined
                ? ""
                : String(property.uds),

        unitConfigurations:
            property.unitConfigurations?.map(
                (configuration, index) => ({
                    id:
                        configuration._id ??
                        `unit-${index}`,
                    bedrooms: String(
                        configuration.bedrooms,
                    ),
                    size: String(
                        configuration.size,
                    ),
                    sizeUnit:
                        configuration.sizeUnit ||
                        "sqft",
                    price: String(
                        configuration.price,
                    ),
                }),
            ) ?? [],

        size:
            property.size === undefined
                ? ""
                : String(property.size),
        sizeUnit: property.sizeUnit || "sqft",
        dimensions: property.dimensions || "",
        ownershipType:
            property.ownershipType || "Freehold",
        price:
            property.price === undefined
                ? ""
                : String(property.price),
        priceType: property.priceType || "Total",
        negotiable:
            property.negotiable ?? true,
        bedrooms:
            property.bedrooms === null ||
            property.bedrooms === undefined
                ? ""
                : String(property.bedrooms),
        bathrooms:
            property.bathrooms === null ||
            property.bathrooms === undefined
                ? ""
                : String(property.bathrooms),
        floors:
            property.floors === null ||
            property.floors === undefined
                ? ""
                : String(property.floors),
        amenities: property.amenities ?? [],
        images: property.images ?? [],
        videoLinks: property.videoLinks ?? [],
        uploadDeleteGrants: {},
        brochure: property.brochure ?? null,
    };
}

function getEditorUploadedFileDescriptor(
    file: EditorUploadFile,
): EditorUploadedFileDescriptor | null {
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

async function requestDraftUploadDeletion(
    files: Array<{
        url: string;
        fileKey: string;
        deleteToken: string;
    }>,
): Promise<void> {
    if (files.length === 0) {
        return;
    }

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
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof payload.error ===
            "string"
                ? payload.error
                : "Unable to remove the uploaded file.";

        throw new Error(message);
    }
}

function toOptionalNumber(
    value: string,
): number | null {
    if (!value.trim()) {
        return null;
    }

    return Number(value);
}

function isValidVideoUrl(
    value: string,
): boolean {
    if (!value.trim()) {
        return true;
    }

    try {
        const parsed = new URL(value);

        return [
            "youtube.com",
            "www.youtube.com",
            "youtu.be",
            "vimeo.com",
            "www.vimeo.com",
        ].includes(parsed.hostname);
    } catch {
        return false;
    }
}

function formatPrice(value: string): string {
    const price = Number(value);

    if (!Number.isFinite(price) || price <= 0) {
        return "Not set";
    }

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(price);
}

function FieldLabel({
                        children,
                        required = false,
                        hint,
                    }: {
    children: React.ReactNode;
    required?: boolean;
    hint?: string;
}) {
    return (
        <span className="mb-2 flex items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.1em] text-slate-500">
      <span>
        {children}
          {required ? (
              <span className="ml-1 text-red-500">
            *
          </span>
          ) : null}
      </span>

            {hint ? (
                <span className="normal-case tracking-normal text-slate-400">
          {hint}
        </span>
            ) : null}
    </span>
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
    children: React.ReactNode;
    disabled?: boolean;
    ariaLabel: string;
}) {
    return (
        <span className="relative block">
      <select
          value={value}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(event) =>
              onChange(event.target.value)
          }
          className="h-13 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-bold text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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

export default function FullPropertyEditorModal({
                                                    isOpen,
                                                    property,
                                                    plan,
                                                    onClose,
                                                    onSaved,
                                                }: FullPropertyEditorModalProps) {
    const [activeStep, setActiveStep] =
        useState<StepId>("basics");
    const [form, setForm] =
        useState<EditorForm | null>(null);
    const [errors, setErrors] =
        useState<Record<string, string>>({});
    const [saving, setSaving] =
        useState(false);
    const [saveError, setSaveError] =
        useState("");
    const [uploadMessage, setUploadMessage] =
        useState("");

    useEffect(() => {
        if (!isOpen || !property) {
            return;
        }

        setForm(createEditorForm(property));
        setActiveStep("basics");
        setErrors({});
        setSaveError("");
        setUploadMessage("");
    }, [isOpen, property]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (
                event.key === "Escape" &&
                !saving
            ) {
                void closeWithoutSaving();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;
            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [
        isOpen,
        saving,
        form?.uploadDeleteGrants,
    ]);

    const maxImages =
        plan.entitlements.maxImages;
    const maxVideoLinks =
        plan.entitlements.maxVideoLinks;
    const activeStepIndex =
        STEPS.findIndex(
            (step) => step.id === activeStep,
        );

    const cityOptions = useMemo(() => {
        if (
            !form?.city ||
            TAMIL_NADU_CITIES.includes(
                form.city,
            )
        ) {
            return TAMIL_NADU_CITIES;
        }

        return [
            form.city,
            ...TAMIL_NADU_CITIES,
        ];
    }, [form?.city]);

    const localityOptions = useMemo(() => {
        if (!form?.city) {
            return [];
        }

        const values =
            getTamilNaduLocalities(form.city);

        if (
            !form.locality ||
            values.includes(form.locality)
        ) {
            return values;
        }

        return [form.locality, ...values];
    }, [form?.city, form?.locality]);

    const isLand = form
        ? isLandPropertyType(
            form.propertyType,
        )
        : false;

    const selectedAmenityCount =
        form?.amenities.length ?? 0;

    function updateForm(
        patch: Partial<EditorForm>,
    ) {
        setForm((current) =>
            current
                ? {
                    ...current,
                    ...patch,
                }
                : current,
        );
    }

    function addUnitConfiguration() {
        setForm((current) => {
            if (!current) {
                return current;
            }

            return {
                ...current,
                unitConfigurations: [
                    ...current.unitConfigurations,
                    {
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
                    },
                ],
            };
        });
    }

    function updateUnitConfiguration(
        id: string,
        patch: Partial<UnitConfigurationForm>,
    ) {
        setForm((current) => {
            if (!current) {
                return current;
            }

            return {
                ...current,
                unitConfigurations:
                    current.unitConfigurations.map(
                        (configuration) =>
                            configuration.id === id
                                ? {
                                    ...configuration,
                                    ...patch,
                                }
                                : configuration,
                    ),
            };
        });
    }

    function removeUnitConfiguration(
        id: string,
    ) {
        setForm((current) => {
            if (!current) {
                return current;
            }

            return {
                ...current,
                unitConfigurations:
                    current.unitConfigurations.filter(
                        (configuration) =>
                            configuration.id !== id,
                    ),
            };
        });
    }

    function getPendingUploadFiles(
        urls?: string[],
    ) {
        const allowedUrls =
            urls === undefined
                ? null
                : new Set(urls);

        return Object.entries(
            form?.uploadDeleteGrants ?? {},
        )
            .filter(
                ([url]) =>
                    !allowedUrls ||
                    allowedUrls.has(url),
            )
            .map(
                ([
                     url,
                     grant,
                 ]) => ({
                    url,
                    fileKey:
                    grant.fileKey,
                    deleteToken:
                    grant.deleteToken,
                }),
            );
    }

    async function closeWithoutSaving() {
        if (saving) {
            return;
        }

        try {
            await requestDraftUploadDeletion(
                getPendingUploadFiles(),
            );
        } catch (error) {
            console.error(
                "Unable to clean up unsaved uploads:",
                error,
            );
        } finally {
            onClose();
        }
    }

    async function removeImage(
        imageUrl: string,
    ) {
        const pending =
            getPendingUploadFiles([
                imageUrl,
            ]);

        if (pending.length > 0) {
            try {
                await requestDraftUploadDeletion(
                    pending,
                );
            } catch (error) {
                setUploadMessage(
                    error instanceof Error
                        ? error.message
                        : "Unable to remove the uploaded image.",
                );
                return;
            }
        }

        setForm((current) => {
            if (!current) {
                return current;
            }

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
            "Image removed. Existing property media will be deleted from storage after you save.",
        );
    }

    async function removeBrochure() {
        const brochureUrl =
            form?.brochure?.url;

        if (!brochureUrl) {
            return;
        }

        const pending =
            getPendingUploadFiles([
                brochureUrl,
            ]);

        if (pending.length > 0) {
            try {
                await requestDraftUploadDeletion(
                    pending,
                );
            } catch (error) {
                setUploadMessage(
                    error instanceof Error
                        ? error.message
                        : "Unable to remove the uploaded brochure.",
                );
                return;
            }
        }

        setForm((current) => {
            if (!current) {
                return current;
            }

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
            "Brochure removed. Existing property media will be deleted from storage after you save.",
        );
    }

    function validateStep(
        step: StepId,
    ): boolean {
        if (!form) {
            return false;
        }

        const nextErrors: Record<
            string,
            string
        > = {};

        if (step === "basics") {
            if (!form.purpose) {
                nextErrors.purpose =
                    "Select a listing purpose.";
            }

            if (!form.propertyType) {
                nextErrors.propertyType =
                    "Select a property type.";
            }

            if (
                form.description.length > 2000
            ) {
                nextErrors.description =
                    "Description must be 2,000 characters or fewer.";
            }
        }

        if (step === "location") {
            if (!form.city) {
                nextErrors.city =
                    "Select a city.";
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

            if (
                !Number.isFinite(size) ||
                size <= 0
            ) {
                nextErrors.size =
                    "Enter a valid property size.";
            }

            if (
                form.uds.trim() &&
                (
                    !Number.isFinite(
                        Number(form.uds),
                    ) ||
                    Number(form.uds) < 0 ||
                    Number(form.uds) > 100
                )
            ) {
                nextErrors.uds =
                    "UDS must be between 0% and 100%.";
            }
        }

        if (step === "pricing") {
            const price = Number(form.price);

            if (
                !Number.isFinite(price) ||
                price <= 0
            ) {
                nextErrors.price =
                    "Enter a valid asking price.";
            }

            if (form.unitConfigurations.length > 50) {
                nextErrors.unitConfigurations =
                    "A property can have at most 50 unit configurations.";
            } else {
                const invalidUnitConfiguration =
                    form.unitConfigurations.some(
                        (configuration) => {
                            if (
                                !configuration.bedrooms.trim() ||
                                !configuration.size.trim() ||
                                !configuration.price.trim()
                            ) {
                                return true;
                            }

                            const bedrooms = Number(
                                configuration.bedrooms,
                            );
                            const size = Number(
                                configuration.size,
                            );
                            const price = Number(
                                configuration.price,
                            );

                            return (
                                !Number.isInteger(bedrooms) ||
                                bedrooms < 1 ||
                                bedrooms > 20 ||
                                !Number.isFinite(size) ||
                                size <= 0 ||
                                !Number.isFinite(price) ||
                                price <= 0
                            );
                        },
                    );

                if (invalidUnitConfiguration) {
                    nextErrors.unitConfigurations =
                        "Complete the BHK, size and price for every unit configuration.";
                }
            }

            for (const [key, value] of [
                ["bedrooms", form.bedrooms],
                ["bathrooms", form.bathrooms],
                ["floors", form.floors],
            ] as const) {
                if (
                    value.trim() &&
                    (!Number.isFinite(
                            Number(value),
                        ) ||
                        Number(value) < 0)
                ) {
                    nextErrors[key] =
                        "Enter a valid non-negative number.";
                }
            }
        }

        if (step === "media") {
            if (
                form.images.length > maxImages
            ) {
                nextErrors.images = `Your ${plan.presentation.displayName} plan allows up to ${maxImages} images.`;
            }

            const cleanedLinks =
                form.videoLinks
                    .map((link) => link.trim())
                    .filter(Boolean);

            if (
                cleanedLinks.length >
                maxVideoLinks
            ) {
                nextErrors.videoLinks = `Your ${plan.presentation.displayName} plan allows up to ${maxVideoLinks} video links.`;
            }

            if (
                cleanedLinks.some(
                    (link) =>
                        !isValidVideoUrl(link),
                )
            ) {
                nextErrors.videoLinks =
                    "Only YouTube and Vimeo links are allowed.";
            }
        }

        setErrors(nextErrors);

        return (
            Object.keys(nextErrors).length ===
            0
        );
    }

    function validateAll(): {
        valid: boolean;
        firstInvalidStep: StepId | null;
    } {
        const validationOrder: StepId[] = [
            "basics",
            "location",
            "pricing",
            "media",
        ];

        for (const step of validationOrder) {
            if (!validateStep(step)) {
                return {
                    valid: false,
                    firstInvalidStep: step,
                };
            }
        }

        return {
            valid: true,
            firstInvalidStep: null,
        };
    }

    function goForward() {
        if (!form) {
            return;
        }

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
    }

    function goBack() {
        setErrors({});
        setActiveStep(
            STEPS[
                Math.max(
                    activeStepIndex - 1,
                    0,
                )
                ].id,
        );
    }

    async function handleSave(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        if (!form || !property) {
            return;
        }

        const validation =
            validateAll();

        if (
            !validation.valid &&
            validation.firstInvalidStep
        ) {
            setActiveStep(
                validation.firstInvalidStep,
            );
            return;
        }

        setSaving(true);
        setSaveError("");

        try {
            const payload: Record<
                string,
                unknown
            > = {
                purpose: form.purpose,
                propertyType:
                form.propertyType,
                description:
                    form.description.trim(),
                address: form.address.trim(),
                locality: form.locality,
                developerName:
                    form.developerName.trim(),
                city: form.city,
                state: "Tamil Nadu",
                landmark:
                    form.landmark.trim(),
                uds: toOptionalNumber(form.uds),
                size: Number(form.size),
                sizeUnit: form.sizeUnit,

                unitConfigurations:
                    isLand ||
                    form.propertyType === "Commercial"
                        ? []
                        : form.unitConfigurations.map(
                            (configuration) => ({
                                bedrooms: Number(
                                    configuration.bedrooms,
                                ),
                                size: Number(
                                    configuration.size,
                                ),
                                sizeUnit:
                                configuration.sizeUnit,
                                price: Number(
                                    configuration.price,
                                ),
                            }),
                        ),

                dimensions:
                    form.dimensions.trim(),
                ownershipType:
                form.ownershipType,
                price: Number(form.price),
                priceType: form.priceType,
                negotiable:
                form.negotiable,
                bedrooms: isLand
                    ? null
                    : toOptionalNumber(
                        form.bedrooms,
                    ),
                bathrooms: isLand
                    ? null
                    : toOptionalNumber(
                        form.bathrooms,
                    ),
                floors: isLand
                    ? null
                    : toOptionalNumber(
                        form.floors,
                    ),
                amenities: form.amenities,
                images: form.images,
                videoLinks:
                    form.videoLinks
                        .map((link) =>
                            link.trim(),
                        )
                        .filter(Boolean),
            };

            payload.brochure =
                form.brochure;

            const response = await fetch(
                `/api/property/${property._id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        payload,
                    ),
                },
            );

            const responsePayload: unknown =
                await response.json();

            if (!response.ok) {
                const message =
                    typeof responsePayload ===
                    "object" &&
                    responsePayload !== null &&
                    "error" in
                    responsePayload &&
                    typeof responsePayload.error ===
                    "string"
                        ? responsePayload.error
                        : "Unable to update this property.";

                throw new Error(message);
            }

            if (
                typeof responsePayload !==
                "object" ||
                responsePayload === null ||
                !("property" in responsePayload)
            ) {
                throw new Error(
                    "The update response was incomplete.",
                );
            }

            onSaved(
                responsePayload.property as PropertyEditorProperty,
            );
            onClose();
        } catch (error) {
            setSaveError(
                error instanceof Error
                    ? error.message
                    : "Unable to update this property.",
            );
        } finally {
            setSaving(false);
        }
    }

    if (!form || !property) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen ? (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-5">
                    <motion.button
                        type="button"
                        aria-label="Close full property editor"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() =>
                            void closeWithoutSaving()
                        }
                        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
                    />

                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="full-property-editor-title"
                        initial={{
                            opacity: 0,
                            y: 22,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 22,
                            scale: 0.97,
                        }}
                        className="relative z-10 flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] bg-[#f6f8f7] shadow-[0_40px_120px_rgba(15,23,42,0.42)]"
                    >
                        <header className="relative shrink-0 overflow-hidden bg-slate-950 p-5 pr-16 text-white sm:p-7 sm:pr-20">
                            <div
                                className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl"
                                aria-hidden="true"
                            />

                            <div className="relative">
                                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-teal-300">
                    <EditIcon />
                    Full listing editor
                  </span>

                                    <span className="rounded-full bg-teal-300 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.11em] text-slate-950">
                    {
                        plan.presentation
                            .displayName
                    }{" "}
                                        limits
                  </span>
                                </div>

                                <h2
                                    id="full-property-editor-title"
                                    className="mt-4 line-clamp-2 text-2xl font-black tracking-[-0.03em] sm:text-3xl"
                                >
                                    Edit {property.address}
                                </h2>

                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                                    Update the same property details,
                                    location, facilities and media used
                                    by the posting flow.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    void closeWithoutSaving()
                                }
                                disabled={saving}
                                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-300 transition hover:bg-white hover:text-slate-950 disabled:opacity-50 sm:right-7 sm:top-7"
                                aria-label="Close editor"
                            >
                                <X
                                    size={18}
                                    aria-hidden="true"
                                />
                            </button>
                        </header>

                        <div className="shrink-0 border-b border-slate-200 bg-white">
                            <div className="overflow-x-auto px-4 py-3 sm:px-6">
                                <div className="flex min-w-max gap-2">
                                    {STEPS.map(
                                        (step, index) => {
                                            const Icon =
                                                step.icon;
                                            const active =
                                                step.id ===
                                                activeStep;
                                            const complete =
                                                index <
                                                activeStepIndex;

                                            return (
                                                <button
                                                    key={step.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setErrors({});
                                                        setActiveStep(
                                                            step.id,
                                                        );
                                                    }}
                                                    className={`inline-flex h-11 items-center gap-2 rounded-xl border px-3.5 text-xs font-black transition ${
                                                        active
                                                            ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                                                            : complete
                                                                ? "border-teal-200 bg-teal-50 text-primary"
                                                                : "border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:text-primary"
                                                    }`}
                                                >
                          <span
                              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                                  active
                                      ? "bg-white/15"
                                      : complete
                                          ? "bg-white"
                                          : "bg-slate-50"
                              }`}
                          >
                            {complete ? (
                                <Check
                                    size={14}
                                    aria-hidden="true"
                                />
                            ) : (
                                <Icon
                                    size={14}
                                    aria-hidden="true"
                                />
                            )}
                          </span>

                                                    <span className="sm:hidden">
                            {
                                step.shortLabel
                            }
                          </span>
                                                    <span className="hidden sm:inline">
                            {step.label}
                          </span>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSave}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
                                <AnimatePresence mode="wait">
                                    <motion.section
                                        key={activeStep}
                                        initial={{
                                            opacity: 0,
                                            x: 14,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            x: -14,
                                        }}
                                        className="mx-auto max-w-5xl"
                                    >
                                        {activeStep === "basics" ? (
                                            <div className="space-y-6">
                                                <SectionHeading
                                                    eyebrow="Property basics"
                                                    title="Describe what is being listed"
                                                    description="Change the listing purpose, property category and public description."
                                                    icon={Building2}
                                                />

                                                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                    <fieldset>
                                                        <legend className="text-sm font-black text-slate-950">
                                                            Listing purpose
                                                        </legend>

                                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                            {PROPERTY_PURPOSES.map(
                                                                (
                                                                    purpose,
                                                                ) => {
                                                                    const selected =
                                                                        form.purpose ===
                                                                        purpose;

                                                                    return (
                                                                        <button
                                                                            key={
                                                                                purpose
                                                                            }
                                                                            type="button"
                                                                            aria-pressed={
                                                                                selected
                                                                            }
                                                                            onClick={() =>
                                                                                updateForm(
                                                                                    {
                                                                                        purpose,
                                                                                    },
                                                                                )
                                                                            }
                                                                            className={`rounded-2xl border p-4 text-left transition ${
                                                                                selected
                                                                                    ? "border-primary bg-teal-50 ring-2 ring-primary/10"
                                                                                    : "border-slate-200 bg-slate-50 hover:border-teal-200 hover:bg-white"
                                                                            }`}
                                                                        >
                                      <span
                                          className={`block text-sm font-black ${
                                              selected
                                                  ? "text-primary"
                                                  : "text-slate-950"
                                          }`}
                                      >
                                        {
                                            purpose
                                        }
                                      </span>

                                                                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                                        {purpose ===
                                        "Sell"
                                            ? "List the property for sale."
                                            : purpose ===
                                            "Rent"
                                                ? "List it for rent or lease."
                                                : purpose ===
                                                "PG/CO-Living"
                                                    ? "Shared or managed accommodation."
                                                    : "Existing legacy buy-requirement listing."}
                                      </span>
                                                                        </button>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                        {errors.purpose ? (
                                                            <ErrorText>
                                                                {
                                                                    errors.purpose
                                                                }
                                                            </ErrorText>
                                                        ) : null}
                                                    </fieldset>

                                                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                                        <label>
                                                            <FieldLabel
                                                                required
                                                            >
                                                                Property type
                                                            </FieldLabel>

                                                            <SelectField
                                                                value={
                                                                    form.propertyType
                                                                }
                                                                ariaLabel="Property type"
                                                                onChange={(
                                                                    propertyType,
                                                                ) => {
                                                                    const nextIsLand =
                                                                        isLandPropertyType(
                                                                            propertyType,
                                                                        );

                                                                    const nextIsCommercial =
                                                                        propertyType === "Commercial";

                                                                    updateForm({
                                                                        propertyType,
                                                                        ...(nextIsLand || nextIsCommercial
                                                                            ? {
                                                                                bedrooms: "",
                                                                                bathrooms: "",
                                                                                floors: "",
                                                                                unitConfigurations: [],
                                                                            }
                                                                            : {}),
                                                                    });
                                                                }}
                                                            >
                                                                {PROPERTY_TYPES.map(
                                                                    (type) => (
                                                                        <option
                                                                            key={
                                                                                type
                                                                            }
                                                                            value={
                                                                                type
                                                                            }
                                                                        >
                                                                            {type}
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </SelectField>

                                                            {errors.propertyType ? (
                                                                <ErrorText>
                                                                    {
                                                                        errors.propertyType
                                                                    }
                                                                </ErrorText>
                                                            ) : null}
                                                        </label>

                                                        <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4">
                                                            <div className="flex items-start gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                                  <Info
                                      size={17}
                                      aria-hidden="true"
                                  />
                                </span>
                                                                <div>
                                                                    <p className="text-sm font-black text-slate-950">
                                                                        Type-aware
                                                                        editor
                                                                    </p>
                                                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                                                        Land fields
                                                                        automatically
                                                                        hide residential
                                                                        bedroom and
                                                                        bathroom inputs.
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <label className="mt-6 block">
                                                        <FieldLabel hint={`${form.description.length}/2000`}>
                                                            Property description
                                                        </FieldLabel>

                                                        <textarea
                                                            rows={7}
                                                            maxLength={2000}
                                                            value={
                                                                form.description
                                                            }
                                                            onChange={(
                                                                event,
                                                            ) =>
                                                                updateForm({
                                                                    description:
                                                                    event
                                                                        .target
                                                                        .value,
                                                                })
                                                            }
                                                            placeholder="Describe the property, nearby advantages, condition and anything a buyer or renter should understand."
                                                            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                        />

                                                        {errors.description ? (
                                                            <ErrorText>
                                                                {
                                                                    errors.description
                                                                }
                                                            </ErrorText>
                                                        ) : null}
                                                    </label>
                                                </div>
                                            </div>
                                        ) : null}

                                        {activeStep ===
                                        "location" ? (
                                            <div className="space-y-6">
                                                <SectionHeading
                                                    eyebrow="Location & size"
                                                    title="Use structured Tamil Nadu location fields"
                                                    description="City and locality are selected from the same location data used elsewhere in the product."
                                                    icon={MapPin}
                                                />

                                                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                    <div className="grid gap-5 md:grid-cols-3">
                                                        <label>
                                                            <FieldLabel
                                                                required
                                                            >
                                                                State
                                                            </FieldLabel>

                                                            <SelectField
                                                                value="Tamil Nadu"
                                                                ariaLabel="State"
                                                                disabled
                                                                onChange={() => {}}
                                                            >
                                                                <option value="Tamil Nadu">
                                                                    Tamil Nadu
                                                                </option>
                                                            </SelectField>
                                                        </label>

                                                        <label>
                                                            <FieldLabel
                                                                required
                                                            >
                                                                City
                                                            </FieldLabel>

                                                            <SelectField
                                                                value={
                                                                    form.city
                                                                }
                                                                ariaLabel="City"
                                                                onChange={(
                                                                    city,
                                                                ) =>
                                                                    updateForm({
                                                                        city,
                                                                        locality:
                                                                            "",
                                                                    })
                                                                }
                                                            >
                                                                <option value="">
                                                                    Select city
                                                                </option>
                                                                {cityOptions.map(
                                                                    (city) => (
                                                                        <option
                                                                            key={
                                                                                city
                                                                            }
                                                                            value={
                                                                                city
                                                                            }
                                                                        >
                                                                            {city}
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </SelectField>

                                                            {errors.city ? (
                                                                <ErrorText>
                                                                    {
                                                                        errors.city
                                                                    }
                                                                </ErrorText>
                                                            ) : null}
                                                        </label>

                                                        <label>
                                                            <FieldLabel
                                                                required
                                                            >
                                                                Locality / area
                                                            </FieldLabel>

                                                            <SelectField
                                                                value={
                                                                    form.locality
                                                                }
                                                                ariaLabel="Locality or area"
                                                                disabled={
                                                                    !form.city
                                                                }
                                                                onChange={(
                                                                    locality,
                                                                ) =>
                                                                    updateForm({
                                                                        locality,
                                                                    })
                                                                }
                                                            >
                                                                <option value="">
                                                                    {form.city
                                                                        ? "Select locality"
                                                                        : "Select city first"}
                                                                </option>
                                                                {localityOptions.map(
                                                                    (
                                                                        locality,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                locality
                                                                            }
                                                                            value={
                                                                                locality
                                                                            }
                                                                        >
                                                                            {
                                                                                locality
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </SelectField>

                                                            {errors.locality ? (
                                                                <ErrorText>
                                                                    {
                                                                        errors.locality
                                                                    }
                                                                </ErrorText>
                                                            ) : null}
                                                        </label>
                                                    </div>

                                                    <div className="mt-5 grid gap-5 sm:grid-cols-2">
                                                        <label className="sm:col-span-2">
                                                            <FieldLabel
                                                                required
                                                            >
                                                                Street address /
                                                                house number
                                                            </FieldLabel>

                                                            <input
                                                                value={
                                                                    form.address
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateForm({
                                                                        address:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    })
                                                                }
                                                                placeholder="#123, 2nd Main Road"
                                                                className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                            />

                                                            {errors.address ? (
                                                                <ErrorText>
                                                                    {
                                                                        errors.address
                                                                    }
                                                                </ErrorText>
                                                            ) : null}
                                                        </label>

                                                        <label className="sm:col-span-2">
                                                            <FieldLabel hint="Optional">
                                                                Developer / Builder name
                                                            </FieldLabel>

                                                            <input
                                                                value={form.developerName}
                                                                maxLength={150}
                                                                onChange={(event) =>
                                                                    updateForm({
                                                                        developerName:
                                                                        event.target.value,
                                                                    })
                                                                }
                                                                placeholder="e.g. DAC Developers"
                                                                className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                            />

                                                            <p className="mt-2 text-xs leading-5 text-slate-400">
                                                                This name will appear on the public
                                                                property listing.
                                                            </p>
                                                        </label>

                                                        <label>
                                                            <FieldLabel>
                                                                Nearby landmark
                                                            </FieldLabel>

                                                            <input
                                                                value={
                                                                    form.landmark
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateForm({
                                                                        landmark:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    })
                                                                }
                                                                placeholder="Optional"
                                                                className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                            />
                                                        </label>

                                                        <label>
                                                            <FieldLabel>
                                                                Ownership type
                                                            </FieldLabel>

                                                            <SelectField
                                                                value={
                                                                    form.ownershipType
                                                                }
                                                                ariaLabel="Ownership type"
                                                                onChange={(
                                                                    ownershipType,
                                                                ) =>
                                                                    updateForm({
                                                                        ownershipType,
                                                                    })
                                                                }
                                                            >
                                                                {OWNERSHIP_TYPES.map(
                                                                    (type) => (
                                                                        <option
                                                                            key={
                                                                                type
                                                                            }
                                                                            value={
                                                                                type
                                                                            }
                                                                        >
                                                                            {type}
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </SelectField>
                                                        </label>
                                                    </div>

                                                    <div className="mt-6 border-t border-slate-100 pt-6">
                                                        <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-primary">
                                <Ruler
                                    size={18}
                                    aria-hidden="true"
                                />
                              </span>
                                                            <div>
                                                                <h3 className="font-black text-slate-950">
                                                                    Property area
                                                                </h3>
                                                                <p className="mt-0.5 text-xs text-slate-500">
                                                                    Enter the
                                                                    numeric size and
                                                                    select the unit.
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                                            <label className="lg:col-span-2">
                                                                <FieldLabel
                                                                    required
                                                                >
                                                                    {form.propertyType ===
                                                                    "Apartment"
                                                                        ? "Built-up size"
                                                                        : "Total size"}
                                                                </FieldLabel>

                                                                <div className="grid grid-cols-[minmax(0,1fr)_130px] gap-2">
                                                                    <input
                                                                        type="number"
                                                                        min="0.01"
                                                                        step="any"
                                                                        value={
                                                                            form.size
                                                                        }
                                                                        onChange={(
                                                                            event,
                                                                        ) =>
                                                                            updateForm(
                                                                                {
                                                                                    size: event
                                                                                        .target
                                                                                        .value,
                                                                                },
                                                                            )
                                                                        }
                                                                        placeholder="Enter size"
                                                                        className="h-13 min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                                    />

                                                                    <SelectField
                                                                        value={
                                                                            form.sizeUnit
                                                                        }
                                                                        ariaLabel="Size unit"
                                                                        onChange={(
                                                                            sizeUnit,
                                                                        ) =>
                                                                            updateForm({
                                                                                sizeUnit,
                                                                            })
                                                                        }
                                                                    >
                                                                        {SIZE_UNITS.map(
                                                                            (
                                                                                unit,
                                                                            ) => (
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
                                                                </div>

                                                                {errors.size ? (
                                                                    <ErrorText>
                                                                        {
                                                                            errors.size
                                                                        }
                                                                    </ErrorText>
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
                                                                            const value = event.target.value;

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
                                                                        className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-11 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
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
                                                                <FieldLabel hint="e.g. 40 × 60">
                                                                    Dimensions
                                                                </FieldLabel>

                                                                <input
                                                                    value={
                                                                        form.dimensions
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateForm({
                                                                            dimensions:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        })
                                                                    }
                                                                    placeholder="Optional"
                                                                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}

                                        {activeStep ===
                                        "pricing" ? (
                                            <div className="space-y-6">
                                                <SectionHeading
                                                    eyebrow="Pricing & specifications"
                                                    title="Keep the commercial details accurate"
                                                    description="Update the asking price, negotiability and property-specific counts."
                                                    icon={IndianRupee}
                                                />

                                                <div className="grid gap-6 lg:grid-cols-12">
                                                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-7">
                                                        <div className="grid gap-5 sm:grid-cols-2">
                                                            <label className="sm:col-span-2">
                                                                <FieldLabel
                                                                    required
                                                                >
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
                                      value={
                                          form.price
                                      }
                                      onChange={(
                                          event,
                                      ) =>
                                          updateForm({
                                              price:
                                              event
                                                  .target
                                                  .value,
                                          })
                                      }
                                      className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                  />
                                </span>

                                                                {errors.price ? (
                                                                    <ErrorText>
                                                                        {
                                                                            errors.price
                                                                        }
                                                                    </ErrorText>
                                                                ) : null}
                                                            </label>

                                                            <label>
                                                                <FieldLabel>
                                                                    Price type
                                                                </FieldLabel>

                                                                <SelectField
                                                                    value={
                                                                        form.priceType
                                                                    }
                                                                    ariaLabel="Price type"
                                                                    onChange={(
                                                                        priceType,
                                                                    ) =>
                                                                        updateForm({
                                                                            priceType,
                                                                        })
                                                                    }
                                                                >
                                                                    {PRICE_TYPES.map(
                                                                        (
                                                                            type,
                                                                        ) => (
                                                                            <option
                                                                                key={
                                                                                    type
                                                                                }
                                                                                value={
                                                                                    type
                                                                                }
                                                                            >
                                                                                {type}
                                                                            </option>
                                                                        ),
                                                                    )}
                                                                </SelectField>
                                                            </label>

                                                            <div>
                                                                <FieldLabel>
                                                                    Negotiability
                                                                </FieldLabel>

                                                                <button
                                                                    type="button"
                                                                    aria-pressed={
                                                                        form.negotiable
                                                                    }
                                                                    onClick={() =>
                                                                        updateForm({
                                                                            negotiable:
                                                                                !form.negotiable,
                                                                        })
                                                                    }
                                                                    className={`flex h-13 w-full items-center justify-between rounded-xl border px-4 text-left transition ${
                                                                        form.negotiable
                                                                            ? "border-primary bg-teal-50"
                                                                            : "border-slate-200 bg-slate-50"
                                                                    }`}
                                                                >
                                  <span>
                                    <span className="block text-sm font-black text-slate-950">
                                      {form.negotiable
                                          ? "Negotiable"
                                          : "Fixed price"}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-slate-500">
                                      {form.negotiable
                                          ? "Offers can be discussed."
                                          : "The listed amount is final."}
                                    </span>
                                  </span>

                                                                    <span
                                                                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                                                            form.negotiable
                                                                                ? "border-primary bg-primary text-white"
                                                                                : "border-slate-300 bg-white text-transparent"
                                                                        }`}
                                                                    >
                                    <Check
                                        size={13}
                                        aria-hidden="true"
                                    />
                                  </span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_24px_65px_rgba(15,23,42,0.2)] lg:col-span-5">
                                                        <div
                                                            className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-teal-500/20 blur-3xl"
                                                            aria-hidden="true"
                                                        />

                                                        <div className="relative">
                                                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-300">
                                                                Price preview
                                                            </p>
                                                            <p className="mt-4 text-4xl font-black tracking-tight">
                                                                {formatPrice(
                                                                    form.price,
                                                                )}
                                                            </p>
                                                            <p className="mt-2 text-sm text-slate-400">
                                                                {
                                                                    form.priceType
                                                                }
                                                                {form.negotiable
                                                                    ? " · Negotiable"
                                                                    : " · Fixed"}
                                                            </p>

                                                            <div className="mt-7 rounded-xl border border-white/10 bg-white/[0.055] p-4">
                                                                <p className="text-xs leading-6 text-slate-400">
                                                                    This is the
                                                                    amount shown on
                                                                    the public
                                                                    property card and
                                                                    detail page.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {!isLand &&
                                                form.propertyType !== "Commercial" ? (
                                                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                                                                    Available configurations
                                                                </p>

                                                                <h3 className="mt-2 text-lg font-black text-slate-950">
                                                                    BHK unit options
                                                                </h3>

                                                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                                                    Add the different unit sizes and
                                                                    prices available in this project.
                                                                </p>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={addUnitConfiguration}
                                                                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-black text-white"
                                                            >
                                                                <Plus
                                                                    size={15}
                                                                    aria-hidden="true"
                                                                />
                                                                Add unit
                                                            </button>
                                                        </div>

                                                        {form.unitConfigurations.length >
                                                        0 ? (
                                                            <div className="mt-5 space-y-4">
                                                                {form.unitConfigurations.map(
                                                                    (configuration, index) => (
                                                                        <div
                                                                            key={configuration.id}
                                                                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                                                        >
                                                                            <div className="mb-4 flex items-center justify-between">
                                                                                <p className="text-xs font-black text-slate-950">
                                                                                    Unit {index + 1}
                                                                                </p>

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        removeUnitConfiguration(
                                                                                            configuration.id,
                                                                                        )
                                                                                    }
                                                                                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600"
                                                                                    aria-label={`Remove unit ${index + 1}`}
                                                                                >
                                                                                    <Trash2
                                                                                        size={15}
                                                                                        aria-hidden="true"
                                                                                    />
                                                                                </button>
                                                                            </div>

                                                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                                                                <label>
                                                                                    <FieldLabel required>
                                                                                        BHK
                                                                                    </FieldLabel>

                                                                                    <input
                                                                                        type="number"
                                                                                        min="1"
                                                                                        max="20"
                                                                                        step="1"
                                                                                        value={
                                                                                            configuration.bedrooms
                                                                                        }
                                                                                        onChange={(event) =>
                                                                                            updateUnitConfiguration(
                                                                                                configuration.id,
                                                                                                {
                                                                                                    bedrooms:
                                                                                                    event
                                                                                                        .target
                                                                                                        .value,
                                                                                                },
                                                                                            )
                                                                                        }
                                                                                        placeholder="e.g. 2"
                                                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                                                    />
                                                                                </label>

                                                                                <label>
                                                                                    <FieldLabel required>
                                                                                        Built-up size
                                                                                    </FieldLabel>

                                                                                    <input
                                                                                        type="number"
                                                                                        min="0.01"
                                                                                        step="any"
                                                                                        value={
                                                                                            configuration.size
                                                                                        }
                                                                                        onChange={(event) =>
                                                                                            updateUnitConfiguration(
                                                                                                configuration.id,
                                                                                                {
                                                                                                    size:
                                                                                                    event
                                                                                                        .target
                                                                                                        .value,
                                                                                                },
                                                                                            )
                                                                                        }
                                                                                        placeholder="e.g. 1200"
                                                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                                                    />
                                                                                </label>

                                                                                <label>
                                                                                    <FieldLabel required>
                                                                                        Size unit
                                                                                    </FieldLabel>

                                                                                    <SelectField
                                                                                        value={
                                                                                            configuration.sizeUnit
                                                                                        }
                                                                                        ariaLabel={`Unit ${index + 1} size unit`}
                                                                                        onChange={(
                                                                                            sizeUnit,
                                                                                        ) =>
                                                                                            updateUnitConfiguration(
                                                                                                configuration.id,
                                                                                                {
                                                                                                    sizeUnit,
                                                                                                },
                                                                                            )
                                                                                        }
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

                                                                                    <input
                                                                                        type="number"
                                                                                        min="1"
                                                                                        value={
                                                                                            configuration.price
                                                                                        }
                                                                                        onChange={(event) =>
                                                                                            updateUnitConfiguration(
                                                                                                configuration.id,
                                                                                                {
                                                                                                    price:
                                                                                                    event
                                                                                                        .target
                                                                                                        .value,
                                                                                                },
                                                                                            )
                                                                                        }
                                                                                        placeholder="e.g. 6500000"
                                                                                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-950 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                                                                                    />
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                                                                No separate BHK configurations have
                                                                been added.
                                                            </div>
                                                        )}

                                                        {errors.unitConfigurations ? (
                                                            <ErrorText>
                                                                {errors.unitConfigurations}
                                                            </ErrorText>
                                                        ) : null}
                                                    </div>
                                                ) : null}

                                                {!isLand ? (
                                                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                        <div className="grid gap-5 sm:grid-cols-3">
                                                            <label>
                                                                <FieldLabel>
                                                                    {form.propertyType ===
                                                                    "Apartment"
                                                                        ? "BHK / bedrooms"
                                                                        : "Bedrooms"}
                                                                </FieldLabel>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={
                                                                        form.bedrooms
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateForm({
                                                                            bedrooms:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        })
                                                                    }
                                                                    placeholder="Optional"
                                                                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                                />

                                                                {errors.bedrooms ? (
                                                                    <ErrorText>
                                                                        {
                                                                            errors.bedrooms
                                                                        }
                                                                    </ErrorText>
                                                                ) : null}
                                                            </label>

                                                            <label>
                                                                <FieldLabel>
                                                                    Bathrooms
                                                                </FieldLabel>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={
                                                                        form.bathrooms
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateForm({
                                                                            bathrooms:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        })
                                                                    }
                                                                    placeholder="Optional"
                                                                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                                />

                                                                {errors.bathrooms ? (
                                                                    <ErrorText>
                                                                        {
                                                                            errors.bathrooms
                                                                        }
                                                                    </ErrorText>
                                                                ) : null}
                                                            </label>

                                                            <label>
                                                                <FieldLabel>
                                                                    Total floors
                                                                </FieldLabel>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={
                                                                        form.floors
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateForm({
                                                                            floors:
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        })
                                                                    }
                                                                    placeholder="Optional"
                                                                    className="h-13 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                                                />

                                                                {errors.floors ? (
                                                                    <ErrorText>
                                                                        {
                                                                            errors.floors
                                                                        }
                                                                    </ErrorText>
                                                                ) : null}
                                                            </label>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-start gap-3 rounded-2xl border border-teal-100 bg-teal-50 p-4">
                                                        <Info
                                                            size={18}
                                                            className="mt-0.5 shrink-0 text-primary"
                                                            aria-hidden="true"
                                                        />
                                                        <p className="text-sm leading-6 text-slate-600">
                                                            Bedrooms,
                                                            bathrooms and floor
                                                            counts are not
                                                            applicable to{" "}
                                                            {form.propertyType.toLowerCase()}
                                                            .
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}

                                        {activeStep ===
                                        "amenities" ? (
                                            <div className="space-y-6">
                                                <SectionHeading
                                                    eyebrow="Facilities & amenities"
                                                    title="Show what the property includes"
                                                    description="Select every facility that is genuinely available at the property."
                                                    icon={LayoutGrid}
                                                />

                                                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                    <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                                                        <div>
                                                            <h3 className="font-black text-slate-950">
                                                                Selected
                                                                amenities
                                                            </h3>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {
                                                                    selectedAmenityCount
                                                                }{" "}
                                                                selected
                                                            </p>
                                                        </div>

                                                        {selectedAmenityCount >
                                                        0 ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    updateForm({
                                                                        amenities:
                                                                            [],
                                                                    })
                                                                }
                                                                className="text-xs font-black text-red-600"
                                                            >
                                                                Clear all
                                                            </button>
                                                        ) : null}
                                                    </div>

                                                    <div className="mt-6 space-y-8">
                                                        {AMENITY_CATEGORIES.map(
                                                            (
                                                                category,
                                                            ) => (
                                                                <fieldset
                                                                    key={
                                                                        category.name
                                                                    }
                                                                >
                                                                    <legend className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </legend>

                                                                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                                        {category.amenities.map(
                                                                            (
                                                                                amenity,
                                                                            ) => {
                                                                                const selected =
                                                                                    form.amenities.includes(
                                                                                        amenity,
                                                                                    );

                                                                                return (
                                                                                    <button
                                                                                        key={
                                                                                            amenity
                                                                                        }
                                                                                        type="button"
                                                                                        aria-pressed={
                                                                                            selected
                                                                                        }
                                                                                        onClick={() =>
                                                                                            updateForm(
                                                                                                {
                                                                                                    amenities:
                                                                                                        selected
                                                                                                            ? form.amenities.filter(
                                                                                                                (
                                                                                                                    item,
                                                                                                                ) =>
                                                                                                                    item !==
                                                                                                                    amenity,
                                                                                                            )
                                                                                                            : [
                                                                                                                ...form.amenities,
                                                                                                                amenity,
                                                                                                            ],
                                                                                                },
                                                                                            )
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
                                                                                        {
                                                                                            amenity
                                                                                        }
                                                                                    </button>
                                                                                );
                                                                            },
                                                                        )}
                                                                    </div>
                                                                </fieldset>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}

                                        {activeStep ===
                                        "media" ? (
                                            <div className="space-y-6">
                                                <SectionHeading
                                                    eyebrow="Photos & media"
                                                    title="Control the public presentation"
                                                    description="Add or remove images, choose the cover photo, manage video links and update the property brochure."
                                                    icon={ImageIcon}
                                                />

                                                <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                        <div>
                                                            <h3 className="text-lg font-black text-slate-950">
                                                                Property photos
                                                            </h3>
                                                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                                                The first image is
                                                                used as the cover.
                                                            </p>
                                                        </div>

                                                        <span className="rounded-full bg-teal-50 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-primary">
                              {
                                  form.images.length
                              }
                                                            /{maxImages} images
                            </span>
                                                    </div>

                                                    {uploadMessage ? (
                                                        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-600">
                                                            {uploadMessage}
                                                        </p>
                                                    ) : null}

                                                    {form.images.length <
                                                    maxImages ? (
                                                        <div className="mt-5 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
                                                            <UploadDropzone
                                                                endpoint="propertyImageUploader"
                                                                config={{
                                                                    mode: "auto",
                                                                }}
                                                                onUploadBegin={() =>
                                                                    setUploadMessage(
                                                                        "Uploading image...",
                                                                    )
                                                                }
                                                                onClientUploadComplete={(
                                                                    result,
                                                                ) => {
                                                                    const descriptors = (
                                                                        (result ?? []) as EditorUploadFile[]
                                                                    )
                                                                        .map(
                                                                            getEditorUploadedFileDescriptor,
                                                                        )
                                                                        .filter(
                                                                            (
                                                                                value,
                                                                            ): value is EditorUploadedFileDescriptor =>
                                                                                Boolean(value),
                                                                        );

                                                                    if (
                                                                        descriptors.length ===
                                                                        0
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

                                                                    setForm(
                                                                        (current) => {
                                                                            if (!current) {
                                                                                return current;
                                                                            }

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
                                                                        },
                                                                    );

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
                                                                        overflowFiles.length >
                                                                        0
                                                                    ) {
                                                                        void requestDraftUploadDeletion(
                                                                            overflowFiles,
                                                                        ).catch(
                                                                            (error) =>
                                                                                console.error(
                                                                                    "Unable to remove overflow uploads:",
                                                                                    error,
                                                                                ),
                                                                        );
                                                                    }

                                                                    setUploadMessage(
                                                                        accepted.length > 0
                                                                            ? "Images uploaded successfully."
                                                                            : "The plan image limit has already been reached.",
                                                                    );
                                                                }}
                                                                onUploadError={(
                                                                    error: Error,
                                                                ) =>
                                                                    setUploadMessage(
                                                                        error.message ||
                                                                        "Image upload failed.",
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm font-bold text-slate-600">
                                                            You have reached the
                                                            image limit for the{" "}
                                                            {
                                                                plan.presentation
                                                                    .displayName
                                                            }{" "}
                                                            plan.
                                                        </div>
                                                    )}

                                                    {errors.images ? (
                                                        <ErrorText>
                                                            {errors.images}
                                                        </ErrorText>
                                                    ) : null}

                                                    {form.images.length > 0 ? (
                                                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                            {form.images.map(
                                                                (
                                                                    imageUrl,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={`${imageUrl}-${index}`}
                                                                        className={`group relative overflow-hidden rounded-2xl border bg-slate-100 ${
                                                                            index ===
                                                                            0
                                                                                ? "border-primary ring-2 ring-primary/10"
                                                                                : "border-slate-200"
                                                                        }`}
                                                                    >
                                                                        <img
                                                                            src={
                                                                                imageUrl
                                                                            }
                                                                            alt={`Property image ${index + 1}`}
                                                                            className="h-44 w-full object-cover"
                                                                        />

                                                                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/85 to-transparent p-3 pt-12">
                                      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-950">
                                        {index ===
                                        0
                                            ? "Cover"
                                            : `Photo ${index + 1}`}
                                      </span>

                                                                            <div className="flex gap-2">
                                                                                {index >
                                                                                0 ? (
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            updateForm(
                                                                                                {
                                                                                                    images:
                                                                                                        [
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
                                                                                                },
                                                                                            )
                                                                                        }
                                                                                        className="rounded-lg bg-white/90 px-2.5 py-1.5 text-[9px] font-black text-primary"
                                                                                    >
                                                                                        Make
                                                                                        cover
                                                                                    </button>
                                                                                ) : null}

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        void removeImage(
                                                                                            imageUrl,
                                                                                        )
                                                                                    }
                                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white"
                                                                                    aria-label={`Remove image ${index + 1}`}
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
                                                                    YouTube or Vimeo
                                                                    links only.
                                                                </p>
                                                            </div>

                                                            <span className="rounded-full bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-500">
                                {
                                    form
                                        .videoLinks
                                        .length
                                }
                                                                /
                                                                {
                                                                    maxVideoLinks
                                                                }
                              </span>
                                                        </div>

                                                        {maxVideoLinks >
                                                        0 ? (
                                                            <div className="mt-5 space-y-3">
                                                                {form.videoLinks.map(
                                                                    (
                                                                        link,
                                                                        index,
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
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
                                            value={
                                                link
                                            }
                                            onChange={(
                                                event,
                                            ) =>
                                                updateForm(
                                                    {
                                                        videoLinks:
                                                            form.videoLinks.map(
                                                                (
                                                                    item,
                                                                    itemIndex,
                                                                ) =>
                                                                    itemIndex ===
                                                                    index
                                                                        ? event
                                                                            .target
                                                                            .value
                                                                        : item,
                                                            ),
                                                    },
                                                )
                                            }
                                            placeholder="YouTube or Vimeo URL"
                                            className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-950 outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                                        />
                                      </span>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    updateForm(
                                                                                        {
                                                                                            videoLinks:
                                                                                                form.videoLinks.filter(
                                                                                                    (
                                                                                                        _,
                                                                                                        itemIndex,
                                                                                                    ) =>
                                                                                                        itemIndex !==
                                                                                                        index,
                                                                                                ),
                                                                                        },
                                                                                    )
                                                                                }
                                                                                className="flex h-12 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600"
                                                                                aria-label={`Remove video link ${index + 1}`}
                                                                            >
                                                                                <Trash2
                                                                                    size={15}
                                                                                    aria-hidden="true"
                                                                                />
                                                                            </button>
                                                                        </div>
                                                                    ),
                                                                )}

                                                                {form.videoLinks
                                                                    .length <
                                                                maxVideoLinks ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            updateForm({
                                                                                videoLinks:
                                                                                    [
                                                                                        ...form.videoLinks,
                                                                                        "",
                                                                                    ],
                                                                            })
                                                                        }
                                                                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-black text-slate-700 transition hover:border-primary hover:text-primary"
                                                                    >
                                                                        <Plus
                                                                            size={15}
                                                                            aria-hidden="true"
                                                                        />
                                                                        Add video
                                                                        link
                                                                    </button>
                                                                ) : null}
                                                            </div>
                                                        ) : (
                                                            <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">
                                                                Video links are
                                                                not included in
                                                                this plan.
                                                            </div>
                                                        )}

                                                        {errors.videoLinks ? (
                                                            <ErrorText>
                                                                {
                                                                    errors.videoLinks
                                                                }
                                                            </ErrorText>
                                                        ) : null}
                                                    </div>

                                                    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                                        <h3 className="text-lg font-black text-slate-950">
                                                            Property brochure
                                                        </h3>
                                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                                            Upload a PDF brochure for this property.
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
                                                                            void removeBrochure()
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
                                                                    config={{
                                                                        mode: "auto",
                                                                    }}
                                                                    onUploadBegin={() =>
                                                                        setUploadMessage(
                                                                            "Uploading brochure...",
                                                                        )
                                                                    }
                                                                    onClientUploadComplete={(
                                                                        result,
                                                                    ) => {
                                                                        const file =
                                                                            result?.[0] as
                                                                                | EditorUploadFile
                                                                                | undefined;

                                                                        const descriptor =
                                                                            file
                                                                                ? getEditorUploadedFileDescriptor(
                                                                                    file,
                                                                                )
                                                                                : null;

                                                                        if (!descriptor) {
                                                                            setUploadMessage(
                                                                                "Upload completed, but no brochure URL was returned.",
                                                                            );
                                                                            return;
                                                                        }

                                                                        setForm((current) => {
                                                                            if (!current) {
                                                                                return current;
                                                                            }

                                                                            const nextGrants = {
                                                                                ...current.uploadDeleteGrants,
                                                                            };

                                                                            if (
                                                                                descriptor.fileKey &&
                                                                                descriptor.deleteToken
                                                                            ) {
                                                                                nextGrants[
                                                                                    descriptor.url
                                                                                    ] = {
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
                                                                    onUploadError={(
                                                                        error: Error,
                                                                    ) =>
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

                                        {activeStep ===
                                        "review" ? (
                                            <div className="space-y-6">
                                                <SectionHeading
                                                    eyebrow="Review changes"
                                                    title="Check the complete listing before saving"
                                                    description="Nothing is published until you press Save all changes."
                                                    icon={BadgeCheck}
                                                />

                                                <div className="grid gap-6 lg:grid-cols-12">
                                                    <div className="space-y-6 lg:col-span-7">
                                                        <ReviewCard
                                                            title="Property"
                                                            onEdit={() =>
                                                                setActiveStep(
                                                                    "basics",
                                                                )
                                                            }
                                                        >
                                                            <ReviewRow
                                                                label="Purpose"
                                                                value={
                                                                    form.purpose
                                                                }
                                                            />
                                                            <ReviewRow
                                                                label="Type"
                                                                value={
                                                                    form.propertyType
                                                                }
                                                            />
                                                            <ReviewRow
                                                                label="Description"
                                                                value={
                                                                    form.description ||
                                                                    "No description"
                                                                }
                                                            />
                                                        </ReviewCard>

                                                        <ReviewCard
                                                            title="Location & size"
                                                            onEdit={() =>
                                                                setActiveStep(
                                                                    "location",
                                                                )
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
                                                                label="Size"
                                                                value={`${form.size || "—"} ${form.sizeUnit}`}
                                                            />
                                                            <ReviewRow
                                                                label="Ownership"
                                                                value={
                                                                    form.ownershipType
                                                                }
                                                            />

                                                            <ReviewRow
                                                                label="UDS"
                                                                value={
                                                                    form.uds
                                                                        ? `${form.uds}%`
                                                                        : "Not provided"
                                                                }
                                                            />
                                                        </ReviewCard>

                                                        <ReviewCard
                                                            title="Price & specifications"
                                                            onEdit={() =>
                                                                setActiveStep(
                                                                    "pricing",
                                                                )
                                                            }
                                                        >
                                                            <ReviewRow
                                                                label="Price"
                                                                value={`${formatPrice(form.price)} · ${form.priceType}`}
                                                            />
                                                            <ReviewRow
                                                                label="Negotiability"
                                                                value={
                                                                    form.negotiable
                                                                        ? "Negotiable"
                                                                        : "Fixed price"
                                                                }
                                                            />
                                                            {form.unitConfigurations.length > 0 ? (
                                                                <ReviewRow
                                                                    label="Unit configurations"
                                                                    value={form.unitConfigurations
                                                                        .map(
                                                                            (configuration) =>
                                                                                `${configuration.bedrooms} BHK · ${configuration.size} ${configuration.sizeUnit} · ${formatPrice(configuration.price)}`,
                                                                        )
                                                                        .join("\n")}
                                                                />
                                                            ) : null}
                                                            {!isLand ? (
                                                                <ReviewRow
                                                                    label="Residential specs"
                                                                    value={`${form.bedrooms || "—"} beds · ${form.bathrooms || "—"} baths · ${form.floors || "—"} floors`}
                                                                />
                                                            ) : null}
                                                        </ReviewCard>
                                                    </div>

                                                    <div className="space-y-6 lg:col-span-5">
                                                        <ReviewCard
                                                            title="Facilities"
                                                            onEdit={() =>
                                                                setActiveStep(
                                                                    "amenities",
                                                                )
                                                            }
                                                        >
                                                            <p className="text-sm leading-6 text-slate-600">
                                                                {
                                                                    form
                                                                        .amenities
                                                                        .length
                                                                }{" "}
                                                                amenities
                                                                selected.
                                                            </p>

                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                {form.amenities
                                                                    .slice(
                                                                        0,
                                                                        8,
                                                                    )
                                                                    .map(
                                                                        (
                                                                            amenity,
                                                                        ) => (
                                                                            <span
                                                                                key={
                                                                                    amenity
                                                                                }
                                                                                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-600"
                                                                            >
                                        {
                                            amenity
                                        }
                                      </span>
                                                                        ),
                                                                    )}

                                                                {form.amenities
                                                                    .length >
                                                                8 ? (
                                                                    <span className="rounded-full bg-teal-50 px-3 py-1.5 text-[10px] font-black text-primary">
                                    +
                                                                        {form
                                                                                .amenities
                                                                                .length -
                                                                            8}{" "}
                                                                        more
                                  </span>
                                                                ) : null}
                                                            </div>
                                                        </ReviewCard>

                                                        <ReviewCard
                                                            title="Media"
                                                            onEdit={() =>
                                                                setActiveStep(
                                                                    "media",
                                                                )
                                                            }
                                                        >
                                                            <ReviewRow
                                                                label="Photos"
                                                                value={`${form.images.length}/${maxImages}`}
                                                            />
                                                            <ReviewRow
                                                                label="Video links"
                                                                value={`${form.videoLinks.filter(Boolean).length}/${maxVideoLinks}`}
                                                            />
                                                            <ReviewRow
                                                                label="Brochure"
                                                                value={
                                                                    form.brochure?.fileName ||
                                                                    "Not uploaded"
                                                                }
                                                            />
                                                        </ReviewCard>

                                                        <div className="rounded-[1.75rem] border border-teal-100 bg-teal-50 p-5">
                                                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                                  <Sparkles
                                      size={18}
                                      aria-hidden="true"
                                  />
                                </span>

                                                                <div>
                                                                    <h3 className="font-black text-slate-950">
                                                                        Plan-aware
                                                                        validation
                                                                    </h3>
                                                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                                                        Media limits are
                                                                        checked against
                                                                        the currently
                                                                        active{" "}
                                                                        {
                                                                            plan
                                                                                .presentation
                                                                                .displayName
                                                                        }{" "}
                                                                        plan again on
                                                                        the server.
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

                                {saveError ? (
                                    <div className="mx-auto mt-6 max-w-5xl rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                                        {saveError}
                                    </div>
                                ) : null}
                            </div>

                            <footer className="shrink-0 border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
                                <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs leading-5 text-slate-500">
                                        Step {activeStepIndex + 1} of{" "}
                                        {STEPS.length}:{" "}
                                        {
                                            STEPS[
                                                activeStepIndex
                                                ].label
                                        }
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 sm:flex">
                                        <button
                                            type="button"
                                            onClick={
                                                activeStepIndex ===
                                                0
                                                    ? () =>
                                                        void closeWithoutSaving()
                                                    : goBack
                                            }
                                            disabled={saving}
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 transition hover:border-primary hover:text-primary disabled:opacity-50"
                                        >
                                            {activeStepIndex ===
                                            0 ? (
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

                                        {activeStep ===
                                        "review" ? (
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/20 transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {saving ? (
                                                    <Loader2
                                                        size={17}
                                                        className="animate-spin"
                                                        aria-hidden="true"
                                                    />
                                                ) : (
                                                    <Check
                                                        size={17}
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                Save all changes
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
                        </form>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>
    );
}

function EditIcon() {
    return (
        <Upload
            size={12}
            aria-hidden="true"
        />
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
                <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    {title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function ErrorText({
                       children,
                   }: {
    children: React.ReactNode;
}) {
    return (
        <p className="mt-2 text-xs font-bold text-red-600">
            {children}
        </p>
    );
}

function ReviewCard({
                        title,
                        onEdit,
                        children,
                    }: {
    title: string;
    onEdit: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <h3 className="font-black text-slate-950">
                    {title}
                </h3>

                <button
                    type="button"
                    onClick={onEdit}
                    className="text-xs font-black text-primary"
                >
                    Edit
                </button>
            </div>

            <div className="mt-4 space-y-4">
                {children}
            </div>
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
