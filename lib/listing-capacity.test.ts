import {
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from "vitest";

const state = vi.hoisted(() => ({
    reservations: [] as string[],
    failCreate: false,
    activeProperties: [] as Array<{
        _id: string;
        status: string;
        createdAt: number;
    }>,
}));

vi.mock("@/lib/mongoose", () => ({
    connectDB: vi.fn(),
}));

vi.mock("@/lib/plans", () => ({
    getPlanLimits: vi.fn(() => ({
        tier: "silver",
        activeProperties: 1,
    })),
}));

vi.mock("mongoose", () => {
    class ObjectId {
        private readonly value: string;

        constructor() {
            this.value = Math.random().toString(36).slice(2);
        }

        toString() {
            return this.value;
        }
    }

    return {
        default: {
            Types: { ObjectId },
            startSession: vi.fn(async () => {
                const before = [...state.reservations];

                return {
                    withTransaction: async (
                        callback: () => Promise<void>,
                    ) => {
                        try {
                            await callback();
                        } catch (error) {
                            state.reservations = before;
                            throw error;
                        }
                    },
                    endSession: vi.fn(),
                };
            }),
        },
    };
});

vi.mock("@/models/User", () => ({
    default: {
        findById: vi.fn(() => ({
            session: () => ({
                _id: "user-1",
                listingUsage: {
                    activeListingIds: state.reservations,
                },
                save: vi.fn(),
            }),
        })),
        findOneAndUpdate: vi.fn(async () => {
            if (state.reservations.length >= 1) {
                return null;
            }

            const id = Math.random().toString(36).slice(2);
            state.reservations.push(id);

            return { _id: "user-1" };
        }),
        updateOne: vi.fn(),
    },
}));

vi.mock("@/models/Property", () => ({
    default: {
        create: vi.fn(async () => {
            if (state.failCreate) {
                throw new Error("insert failed");
            }

            return [{ _id: "property-1" }];
        }),
        find: vi.fn(() => ({
            sort: () => ({
                session: async () =>
                    state.activeProperties
                        .filter((property) =>
                            property.status === "active",
                        )
                        .sort(
                            (left, right) =>
                                right.createdAt -
                                left.createdAt,
                        ),
            }),
        })),
        updateMany: vi.fn(async (filter: any, update: any) => {
            for (const property of state.activeProperties) {
                if (
                    filter._id?.$in?.includes(
                        property._id,
                    )
                ) {
                    property.status = update.$set.status;
                }
            }
        }),
    },
}));

import {
    createActiveListing,
    ListingCapacityError,
    setListingCapacity,
} from "@/lib/listing-capacity";

describe("listing capacity", () => {
    beforeEach(() => {
        state.reservations = [];
        state.failCreate = false;
        state.activeProperties = [];
    });

    it("allows only one of two concurrent Silver create attempts", async () => {
        const results = await Promise.allSettled([
            createActiveListing("user-1", { address: "A" }),
            createActiveListing("user-1", { address: "B" }),
        ]);

        expect(
            results.filter(
                (result) =>
                    result.status === "fulfilled",
            ),
        ).toHaveLength(1);

        expect(
            results.filter(
                (result) =>
                    result.status === "rejected" &&
                    result.reason instanceof
                    ListingCapacityError,
            ),
        ).toHaveLength(1);
    });

    it("rolls back a reservation when property creation fails", async () => {
        state.failCreate = true;

        await expect(
            createActiveListing("user-1", {
                address: "A",
            }),
        ).rejects.toThrow("insert failed");

        expect(state.reservations).toEqual([]);
    });

    it("keeps the newest active listing when capacity drops to Silver", async () => {
        state.activeProperties = [
            {
                _id: "older",
                status: "active",
                createdAt: 1,
            },
            {
                _id: "newer",
                status: "active",
                createdAt: 2,
            },
        ];

        const user: any = {
            _id: "user-1",
            listingUsage: {
                activeListingIds: ["older", "newer"],
            },
            save: vi.fn(),
        };

        const result = await setListingCapacity(
            user,
            1,
            {} as any,
        );

        expect(
            result.kept.map(
                (property: any) => property._id,
            ),
        ).toEqual(["newer"]);
        expect(
            result.deactivated.map(
                (property: any) => property._id,
            ),
        ).toEqual(["older"]);
        expect(
            user.listingUsage.activeListingIds,
        ).toEqual(["newer"]);
        expect(
            state.activeProperties.find(
                (property) => property._id === "older",
            )?.status,
        ).toBe("inactive");
    });
});
