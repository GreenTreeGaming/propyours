export type StoredUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    company?: string;
    city?: string;
    bio?: string;
    favorites?: string[];
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
    localStorage.setItem("user", JSON.stringify(user));
}

export function clearStoredUser() {
    localStorage.removeItem("user");
}

export function updateStoredUserFavorites(favorites: string[]) {
    const user = getStoredUser();

    if (!user) return;

    user.favorites = favorites;

    setStoredUser(user);
}