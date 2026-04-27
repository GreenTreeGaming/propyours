"use client";

export type StoredUser = {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    favorites?: string[];
    [key: string]: unknown;
};

export function getStoredUser(): StoredUser | null {
    if (typeof window === "undefined") return null;

    const rawUser = window.localStorage.getItem("user");
    if (!rawUser) return null;

    try {
        return JSON.parse(rawUser) as StoredUser;
    } catch {
        return null;
    }
}

export function getStoredUserId() {
    const user = getStoredUser();
    return user?.id || user?._id || null;
}

export function setStoredUser(user: StoredUser) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("user", JSON.stringify(user));
}

export function updateStoredUserFavorites(favorites: string[]) {
    const user = getStoredUser();
    if (!user) return;

    setStoredUser({
        ...user,
        favorites,
    });
}
