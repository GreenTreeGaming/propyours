type PublicUserInput = {
    _id?: { toString(): string } | string;
    name?: unknown;
    role?: unknown;
    bio?: unknown;
    company?: unknown;
    city?: unknown;
    plan?: {
        audience?: unknown;
        tier?: unknown;
        status?: unknown;
        expiresAt?: unknown;
    };
};

function stringOrEmpty(value: unknown): string {
    return typeof value === "string" ? value : "";
}

function getId(user: PublicUserInput): string {
    return user._id?.toString() ?? "";
}

function isActiveBuilderPlan(plan: PublicUserInput["plan"]): boolean {
    if (
        !plan ||
        plan.audience !== "builder" ||
        plan.status !== "active"
    ) {
        return false;
    }

    if (!plan.expiresAt) {
        return true;
    }

    const expiresAt = new Date(String(plan.expiresAt));

    return (
        Number.isFinite(expiresAt.getTime()) &&
        expiresAt.getTime() > Date.now()
    );
}

export function toPublicUserProfile(user: PublicUserInput) {
    const activeBuilderPlan = isActiveBuilderPlan(user.plan);

    return {
        id: getId(user),
        name: stringOrEmpty(user.name),
        role: user.role === "Builder" ? "Builder" : "User",
        bio: stringOrEmpty(user.bio),
        company: stringOrEmpty(user.company),
        city: stringOrEmpty(user.city),
        builderPlan: {
            tier:
                activeBuilderPlan &&
                typeof user.plan?.tier === "string"
                    ? user.plan.tier
                    : null,
            isActive: activeBuilderPlan,
        },
    };
}
