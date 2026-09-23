"use client";

import { CITY_CENTERS } from "@/lib/map-locations";
import TileMap from "@/components/TileMap";

export default function MapPinPicker({ city, latitude, longitude, onChange }: { city: string; latitude: string; longitude: string; onChange: (latitude: string, longitude: string) => void }) {
    const mapCity = city in CITY_CENTERS ? city : "Chennai";
    const lat = Number(latitude), lon = Number(longitude);
    const hasPin = latitude !== "" && longitude !== "" && Number.isFinite(lat) && Number.isFinite(lon);
    return <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-black text-slate-900">Pin this property on the map</p>
        <p className="mt-1 text-xs text-slate-600">Pan and zoom to the exact street, then tap the map to place the property pin.</p>
        <div className="mt-3 overflow-hidden rounded-xl"><TileMap city={mapCity} height={288} pins={hasPin ? [{ id: "selected", latitude: lat, longitude: lon, label: "Selected property" }] : []} onPick={(latitude, longitude) => onChange(latitude.toFixed(6), longitude.toFixed(6))} /></div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2"><label className="text-xs font-bold text-slate-700">Latitude<input type="number" min="8" max="14" step="any" value={latitude} onChange={(event) => onChange(event.target.value, longitude)} placeholder="e.g. 13.0827" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label><label className="text-xs font-bold text-slate-700">Longitude<input type="number" min="76" max="81" step="any" value={longitude} onChange={(event) => onChange(latitude, event.target.value)} placeholder="e.g. 80.2707" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label></div>
        {hasPin && <p className="mt-2 text-xs text-slate-600">Pin: {latitude}, {longitude} <button type="button" className="ml-2 font-bold text-primary underline" onClick={() => onChange("", "")}>Clear</button></p>}
    </div>;
}
