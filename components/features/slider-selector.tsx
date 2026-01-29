"use client";

import { Slider } from "@/components/ui/slider";
import {
  useReportForm,
  useReportActions,
} from "@/store/report/report-store-provider";

interface SliderSelectorProps {
  max?: number;
  step?: number;
  labels: string[];
  title: string;
  outputLabel: (value: number) => string;
}

export function SliderSelector({
  max = 100,
  step = 1,
  labels,
  title,
  outputLabel,
}: SliderSelectorProps) {
  const urgency = useReportForm().urgency;
  const { setUrgency } = useReportActions();

  const handleValueChange = (value: number[]) => {
    setUrgency(value[0]);
  };

  return (
    <div className="bg-primary/5 p-6 rounded-xl border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between items-center mb-5">
        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded">
          {outputLabel(urgency)}
        </span>
      </div>
      <Slider
        value={[urgency]}
        max={max}
        step={step}
        className="mx-auto w-full cursor-pointer"
        onValueChange={handleValueChange}
      />
      <div className="flex justify-between mt-3 px-1">
        {labels.map((label, index) => (
          <span
            key={index}
            className="text-[10px] font-bold text-gray-500 uppercase"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
