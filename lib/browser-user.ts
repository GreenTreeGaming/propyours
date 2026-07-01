export type PlanTier =
    | "silver"
    | "gold"
    | "diamond"
    | "builder-starter"
    | "builder-growth"
    | "builder-elite";

export type PlanStatus = "free" | "active" | "expired" | "cancelled";

export type PlanAudience = "owner" | "builder";

export type StoredUserPlan = {
    audience?: PlanAudience;
    tier?: PlanTier;
    status?: PlanStatus;
    expiresAt?: string;
    promoteBoostsRemaining?: number;
};

export type StoredUser = {
    id: string;
    name: string;
    email: string;
    role?: string;
    phone?: string;
    company?: string;
    city?: string;
    favorites?: string[];
    plan?: StoredUserPlan;
};

export function getStoredUser(): StoredUser | null {
    if (typeof window === "undefined") {
        return null;
    }

    const raw = localStorage.getItem("user");

    if (!raw) {
        return null;
    }

    try {
        return JSON.parse(raw) as StoredUser;
    } catch {
        localStorage.removeItem("user");
        return null;
    }
}

export function setStoredUser(user: StoredUser) {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.setItem("user", JSON.stringify(user));
}

export function clearStoredUser() {
    if (typeof window === "undefined") {
        return;
    }

    localStorage.removeItem("user");
}

export function updateStoredUserFavorites(favorites: string[]) {
    const user = getStoredUser();

    if (!user) return;

    user.favorites = favorites;

    setStoredUser(user);
}

export function updateStoredUserPlan(plan: StoredUserPlan) {
    const user = getStoredUser();

    if (!user) return;

    user.plan = plan;

    setStoredUser(user);
}

export function refreshStoredUser(user: StoredUser) {
    setStoredUser(user);
}