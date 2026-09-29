import Property from "@/models/Property";
import User from "@/models/User";

export const PROPYOURS_ACCOUNT_EMAIL = "reach@propyours.com";

// Only listings that existed when the requested backfill was introduced.
// New listings keep the brokerage choice made in the property form.
const EXISTING_LISTING_CUTOFF = new Date("2026-09-29T16:28:09.000Z");

const SYNC_INTERVAL_MS = 5 * 60 * 1000;

let lastSyncAt = 0;
let activeSync: Promise<void> | null = null;

export async function syncPropyoursZeroBrokerageListings(): Promise<void> {
    if (Date.now() - lastSyncAt < SYNC_INTERVAL_MS) {
        return;
    }

    if (activeSync) {
        return activeSync;
    }

    activeSync = (async () => {
        const account = await User.findOne({
            email: PROPYOURS_ACCOUNT_EMAIL,
        })
            .select("_id")
            .lean();

        if (account) {
            await Property.updateMany(
                {
                    userId: account._id,
                    createdAt: { $lt: EXISTING_LISTING_CUTOFF },
                    commissionType: { $exists: false },
                },
                {
                    $set: {
                        zeroCommission: true,
                        commissionType: "zero",
                    },
                },
            );
        }

        lastSyncAt = Date.now();
    })().finally(() => {
        activeSync = null;
    });

    return activeSync;
}
