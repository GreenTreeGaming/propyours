export const CITY_CENTERS: Record<string, [number, number]> = {
    Chennai: [13.0827, 80.2707], Coimbatore: [11.0168, 76.9558], Madurai: [9.9252, 78.1198],
    Trichy: [10.7905, 78.7047], Salem: [11.6643, 78.1460], Vellore: [12.9165, 79.1325],
    Erode: [11.3410, 77.7172], Tiruppur: [11.1085, 77.3411], Tirunelveli: [8.7139, 77.7567],
    Thanjavur: [10.7870, 79.1378], Thoothukudi: [8.7642, 78.1348], Nagercoil: [8.1833, 77.4119],
    Hosur: [12.7409, 77.8253], Kanchipuram: [12.8342, 79.7036], Dindigul: [10.3624, 77.9695],
    Karur: [10.9601, 78.0766], Kumbakonam: [10.9617, 79.3881], Sivakasi: [9.4533, 77.8024],
};

export function validMapPoint(latitude: unknown, longitude: unknown): boolean {
    if ((latitude === null || latitude === undefined) && (longitude === null || longitude === undefined)) return true;
    return typeof latitude === "number" && Number.isFinite(latitude) && latitude >= 8 && latitude <= 14 &&
        typeof longitude === "number" && Number.isFinite(longitude) && longitude >= 76 && longitude <= 81;
}
