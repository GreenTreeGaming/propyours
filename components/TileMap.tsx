"use client";

import { useEffect, useRef, useState } from "react";
import { CITY_CENTERS } from "@/lib/map-locations";

type Pin = { id: string; latitude: number; longitude: number; label: string };
type Props = { city: string; height: number; pins?: Pin[]; onSelect?: (id: string) => void; onPick?: (latitude: number, longitude: number) => void };

const TILE_SIZE = 256;
const ZOOM = 11;
const WORLD_SIZE = TILE_SIZE * 2 ** ZOOM;

function project(latitude: number, longitude: number) {
    const clamped = Math.max(-85, Math.min(85, latitude));
    const sine = Math.sin(clamped * Math.PI / 180);
    return {
        x: (longitude + 180) / 360 * WORLD_SIZE,
        y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * WORLD_SIZE,
    };
}

function unproject(x: number, y: number): [number, number] {
    const longitude = x / WORLD_SIZE * 360 - 180;
    const latitude = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / WORLD_SIZE))) * 180 / Math.PI;
    return [latitude, longitude];
}

export default function TileMap({ city, height, pins = [], onSelect, onPick }: Props) {
    const container = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const node = container.current;
        if (!node) return;
        const observer = new ResizeObserver((entries) => setWidth(entries[0]?.contentRect.width ?? 0));
        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    const [centerLat, centerLon] = CITY_CENTERS[city] ?? CITY_CENTERS.Chennai;
    const center = project(centerLat, centerLon);
    const leftWorld = center.x - width / 2;
    const topWorld = center.y - height / 2;
    const tiles: Array<{ x: number; y: number; left: number; top: number }> = [];
    if (width > 0) {
        const minX = Math.floor(leftWorld / TILE_SIZE);
        const maxX = Math.floor((leftWorld + width) / TILE_SIZE);
        const minY = Math.floor(topWorld / TILE_SIZE);
        const maxY = Math.floor((topWorld + height) / TILE_SIZE);
        for (let x = minX; x <= maxX; x++) for (let y = minY; y <= maxY; y++) {
            tiles.push({ x, y, left: x * TILE_SIZE - leftWorld, top: y * TILE_SIZE - topWorld });
        }
    }
    return <div ref={container} className="relative w-full overflow-hidden bg-slate-100" style={{ height }}>
        {tiles.map((tile) => <div key={`${tile.x}-${tile.y}`} className="pointer-events-none absolute" style={{ left: tile.left, top: tile.top, width: TILE_SIZE, height: TILE_SIZE, backgroundImage: `url(https://tile.openstreetmap.org/${ZOOM}/${tile.x}/${tile.y}.png)` }} />)}
        {onPick && <button type="button" aria-label="Set property map pin" className="absolute inset-0 z-10 h-full w-full cursor-crosshair" onClick={(event) => {
            const rectangle = event.currentTarget.getBoundingClientRect();
            const [lat, lon] = unproject(leftWorld + event.clientX - rectangle.left, topWorld + event.clientY - rectangle.top);
            onPick(lat, lon);
        }} />}
        {pins.map((pin) => {
            const point = project(pin.latitude, pin.longitude);
            const left = point.x - leftWorld, top = point.y - topWorld;
            if (left < 0 || left > width || top < 0 || top > height) return null;
            return onSelect ? <button key={pin.id} type="button" title={pin.label} onClick={() => onSelect(pin.id)} style={{ left, top }} className="absolute z-20 -translate-x-1/2 -translate-y-full rounded-full border-2 border-white bg-teal-700 px-2 py-1 text-xs font-black text-white shadow-lg">{pin.label}</button> : <span key={pin.id} aria-label={pin.label} style={{ left, top }} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full text-3xl drop-shadow-lg">📍</span>;
        })}
        <span className="pointer-events-none absolute bottom-1 right-1 z-20 rounded bg-white/85 px-1 text-[10px] text-slate-600">© OpenStreetMap contributors</span>
    </div>;
}
