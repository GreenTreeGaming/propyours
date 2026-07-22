import {
    z,
} from "zod";

export const analyticsEventSchema =
    z.object({
        type: z.enum([
            "view",
            "phoneClick",
        ]),
    });