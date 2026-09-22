"use client";

import Link from "next/link";
import { useState } from "react";
import { CITY_CENTERS } from "@/lib/map-locations";
import TileMap from "@/components/TileMap";

type MapProperty = { _id: string; address: string; locality?: string; city: string; latitude?: number | null; longitude?: number | null };

export default function PropertyMap({ properties, city }: { properties: MapProperty[]; city: string }) {
    const [selected, setSelected] = useState<string | null>(null);
    const [cityChoice, setCityChoice] = useState(city);
    const [search, setSearch] = useState("");
    const cities = [...new Set(properties.map((property) => property.city))].filter((name) => name in CITY_CENTERS);
    const mapCity = cityChoice in CITY_CENTERS ? cityChoice : cities[0] ?? "Chennai";
    const visible = properties.filter((property) => property.city === mapCity && `${property.address} ${property.locality ?? ""}`.toLowerCase().includes(search.toLowerCase()));
    const [fallbackLat, fallbackLon] = CITY_CENTERS[mapCity];
    const pins = visible.map((property, index) => {
        const precise = typeof property.latitude === "number" && typeof property.longitude === "number";
        return {
            id: property._id,
            latitude: precise ? property.latitude! : fallbackLat + (index % 7 - 3) * 0.006,
            longitude: precise ? property.longitude! : fallbackLon + (Math.floor(index / 7) % 7 - 3) * 0.006,
            label: String(index + 1),
        };
    });
    return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-4">
            <strong>Loaded properties on the map · {mapCity}</strong>
            <div className="flex flex-wrap gap-2"><select aria-label="Map city" value={mapCity} onChange={(event) => { setCityChoice(event.target.value); setSelected(null); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">{cities.map((name) => <option key={name} value={name}>{name}</option>)}</select><input aria-label="Search properties on map" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search area or address" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <span className="text-xs text-slate-500">City markers are approximate until a listing has a precise pin.</span>
        </div>
        <TileMap city={mapCity} height={520} pins={pins} onSelect={setSelected} />
        {selected && <div className="p-4">{visible.filter((property) => property._id === selected).map((property) => <p key={property._id} className="text-sm"><strong>{property.address}</strong>, {property.locality}, {property.city} · <Link className="font-bold text-teal-700 underline" href={`/property/${property._id}`}>View listing</Link></p>)}</div>}
    </div>;
}
