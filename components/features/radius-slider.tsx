"use client";

import { Slider } from "@/components/ui/slider";
import { MapPin } from "lucide-react";

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  saving?: boolean;
}

export function RadiusSlider({ value, onChange, saving = false }: RadiusSliderProps) {
  return (
    <div className="bg-primary/5 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold uppercase tracking-wider">
            Keresési sugár
          </span>
        </div>
        <span className="text-sm font-bold text-primary">
          {value} km{saving && <span className="text-xs text-muted-foreground ml-1">mentés...</span>}
        </span>
      </div>
      <Slider
        value={[value]}
        min={5}
        max={100}
        step={5}
        className="cursor-pointer"
        onValueChange={(v) => onChange(v[0])}
      />
      <div className="flex justify-between mt-2 px-0.5">
        <span className="text-[10px] text-muted-foreground">5 km</span>
        <span className="text-[10px] text-muted-foreground">100 km</span>
      </div>
    </div>
  );
}
