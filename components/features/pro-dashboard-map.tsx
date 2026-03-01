"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ProReport } from "@/types/report";
import { Category } from "@/types/category";

function urgencyColor(urgency: number): string {
  if (urgency < 50) return "#22c55e"; // green-500
  if (urgency < 100) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}

function urgencyLabel(urgency: number): string {
  if (urgency === 0) return "Ráér";
  if (urgency === 50) return "Pár napon belül";
  return "Sürgős";
}

// Recenter the map when center changes
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

interface ProDashboardMapProps {
  center: [number, number];
  radiusKm: number;
  reports: ProReport[];
  categories: Category[];
  highlightedId?: number | null;
  onPinClick?: (id: number) => void;
}

export function ProDashboardMap({
  center,
  radiusKm,
  reports,
  categories,
  highlightedId,
  onPinClick,
}: ProDashboardMapProps) {
  const getCategoryLabel = (categoryId: number) =>
    categories.find((c) => String(c.id) === String(categoryId))?.label ?? "Ismeretlen";

  return (
    <MapContainer
      center={center}
      zoom={11}
      className="w-full h-full"
      zoomControl={true}
    >
      <MapRecenter center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Radius circle */}
      <Circle
        center={center}
        radius={radiusKm * 1000}
        pathOptions={{
          color: "#6366f1",
          fillColor: "#6366f1",
          fillOpacity: 0.08,
          weight: 2,
          dashArray: "6 4",
        }}
      />

      {/* Own location */}
      <CircleMarker
        center={center}
        radius={10}
        pathOptions={{
          color: "#6366f1",
          fillColor: "#6366f1",
          fillOpacity: 1,
          weight: 3,
        }}
      >
        <Popup>
          <span className="text-xs font-bold">Te vagy itt</span>
        </Popup>
      </CircleMarker>

      {/* Report pins */}
      {reports.map((report) => (
        <CircleMarker
          key={report.id}
          center={[report.lat, report.lng]}
          radius={highlightedId === report.id ? 14 : 10}
          pathOptions={{
            color: urgencyColor(report.urgency),
            fillColor: urgencyColor(report.urgency),
            fillOpacity: highlightedId === report.id ? 1 : 0.75,
            weight: highlightedId === report.id ? 3 : 2,
          }}
          eventHandlers={{
            click: () => onPinClick?.(report.id),
          }}
        >
          <Popup>
            <div className="text-xs space-y-0.5">
              <p className="font-bold">{getCategoryLabel(report.categoryId)}</p>
              <p className="text-slate-600">{report.description}</p>
              <p className="text-muted-foreground">
                {urgencyLabel(report.urgency)} · {report.distanceKm.toFixed(1)} km
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
