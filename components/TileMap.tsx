"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import { Minus, Plus } from "lucide-react";
import { CITY_CENTERS } from "@/lib/map-locations";

type Pin = { id: string; latitude: number; longitude: number; label: string };
type Props = { city: string; height: number; pins?: Pin[]; onSelect?: (id: string) => void; onPick?: (latitude: number, longitude: number) => void };
type Center = { latitude: number; longitude: number };
const TILE_SIZE = 256, MIN_ZOOM = 8, MAX_ZOOM = 18;
const worldSize = (zoom: number) => TILE_SIZE * 2 ** zoom;

function project(latitude: number, longitude: number, zoom: number) {
    const size = worldSize(zoom), clamped = Math.max(-85, Math.min(85, latitude));
    const sine = Math.sin(clamped * Math.PI / 180);
    return { x: (longitude + 180) / 360 * size, y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * size };
}
function unproject(x: number, y: number, zoom: number): [number, number] {
    const size = worldSize(zoom);
    return [Math.atan(Math.sinh(Math.PI * (1 - 2 * y / size))) * 180 / Math.PI, x / size * 360 - 180];
}

export default function TileMap({ city, height, pins = [], onSelect, onPick }: Props) {
    const container = useRef<HTMLDivElement>(null);
    const drag = useRef<{ pointerId: number; x: number; y: number; center: Center; moved: boolean } | null>(null);
    const [width, setWidth] = useState(0);
    const [zoom, setZoom] = useState(onPick ? 14 : 11);
    const initial = CITY_CENTERS[city] ?? CITY_CENTERS.Chennai;
    const [center, setCenter] = useState<Center>(() => ({ latitude: initial[0], longitude: initial[1] }));

    useEffect(() => {
        const point = CITY_CENTERS[city] ?? CITY_CENTERS.Chennai;
        setCenter({ latitude: point[0], longitude: point[1] });
        setZoom(onPick ? 14 : 11);
    }, [city]);
    useEffect(() => {
        const node = container.current;
        if (!node) return;
        const observer = new ResizeObserver((entries) => setWidth(entries[0]?.contentRect.width ?? 0));
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    const centerPoint = project(center.latitude, center.longitude, zoom);
    const leftWorld = centerPoint.x - width / 2, topWorld = centerPoint.y - height / 2;
    const tileCount = 2 ** zoom;
    const tiles: Array<{ key: string; x: number; y: number; left: number; top: number }> = [];
    if (width > 0) {
        const minX = Math.floor(leftWorld / TILE_SIZE), maxX = Math.floor((leftWorld + width) / TILE_SIZE);
        const minY = Math.max(0, Math.floor(topWorld / TILE_SIZE)), maxY = Math.min(tileCount - 1, Math.floor((topWorld + height) / TILE_SIZE));
        for (let x = minX; x <= maxX; x++) for (let y = minY; y <= maxY; y++) tiles.push({ key: `${zoom}-${x}-${y}`, x: ((x % tileCount) + tileCount) % tileCount, y, left: x * TILE_SIZE - leftWorld, top: y * TILE_SIZE - topWorld });
    }

    function beginPan(event: ReactPointerEvent<HTMLDivElement>) {
        if ((event.target as HTMLElement).closest("button")) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, center, moved: false };
    }
    function pan(event: ReactPointerEvent<HTMLDivElement>) {
        const current = drag.current;
        if (!current || current.pointerId !== event.pointerId) return;
        const dx = event.clientX - current.x, dy = event.clientY - current.y;
        if (Math.abs(dx) + Math.abs(dy) > 5) current.moved = true;
        const origin = project(current.center.latitude, current.center.longitude, zoom);
        const [latitude, longitude] = unproject(origin.x - dx, origin.y - dy, zoom);
        setCenter({ latitude, longitude });
    }
    function finishPan(event: ReactPointerEvent<HTMLDivElement>) {
        const current = drag.current;
        if (!current || current.pointerId !== event.pointerId) return;
        if (!current.moved && onPick && container.current) {
            const rectangle = container.current.getBoundingClientRect();
            const [latitude, longitude] = unproject(leftWorld + event.clientX - rectangle.left, topWorld + event.clientY - rectangle.top, zoom);
            onPick(latitude, longitude);
        }
        drag.current = null;
    }
    function handleWheel(event: WheelEvent<HTMLDivElement>) {
        event.preventDefault();
        setZoom((value) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value + (event.deltaY < 0 ? 1 : -1))));
    }

    return <div ref={container} className="relative w-full cursor-grab select-none overflow-hidden bg-slate-100 active:cursor-grabbing" style={{ height, touchAction: "none" }} onPointerDown={beginPan} onPointerMove={pan} onPointerUp={finishPan} onPointerCancel={() => { drag.current = null; }} onWheel={handleWheel}>
        {tiles.map((tile) => <div key={tile.key} className="pointer-events-none absolute bg-cover" style={{ left: tile.left, top: tile.top, width: TILE_SIZE, height: TILE_SIZE, backgroundImage: `url(https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png)` }} />)}
        {pins.map((pin) => {
            const point = project(pin.latitude, pin.longitude, zoom), left = point.x - leftWorld, top = point.y - topWorld;
            if (left < 0 || left > width || top < 0 || top > height) return null;
            return onSelect ? <button key={pin.id} type="button" title={pin.label} onClick={(event) => { event.stopPropagation(); onSelect(pin.id); }} style={{ left, top }} className="absolute z-20 -translate-x-1/2 -translate-y-full rounded-full border-2 border-white bg-teal-700 px-2 py-1 text-xs font-black text-white shadow-lg">{pin.label}</button> : <span key={pin.id} aria-label={pin.label} style={{ left, top }} className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full text-3xl drop-shadow-lg">📍</span>;
        })}
        <div className="absolute right-3 top-3 z-30 grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <button type="button" aria-label="Zoom in" onClick={(event) => { event.stopPropagation(); setZoom((value) => Math.min(MAX_ZOOM, value + 1)); }} className="flex h-10 w-10 items-center justify-center text-slate-700 hover:bg-teal-50 hover:text-primary"><Plus size={18} /></button>
            <button type="button" aria-label="Zoom out" onClick={(event) => { event.stopPropagation(); setZoom((value) => Math.max(MIN_ZOOM, value - 1)); }} className="flex h-10 w-10 items-center justify-center border-t border-slate-200 text-slate-700 hover:bg-teal-50 hover:text-primary"><Minus size={18} /></button>
        </div>
        {onPick && <span className="pointer-events-none absolute bottom-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950/75 px-3 py-1.5 text-[10px] font-bold text-white">Drag to pan · scroll or use +/− to zoom · tap to place pin</span>}
        <span className="pointer-events-none absolute bottom-1 right-1 z-20 rounded bg-white/85 px-1 text-[10px] text-slate-600">© OpenStreetMap contributors</span>
    </div>;
}
