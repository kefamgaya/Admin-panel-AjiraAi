"use client";

import { Button, Select, SelectItem } from "@tremor/react";
import { Calendar, CalendarDays } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { startOfDay, endOfDay, subDays, format } from "date-fns";

type DateRangePreset = 
  | "all"
  | "today" 
  | "3days" 
  | "7days" 
  | "14days" 
  | "30days" 
  | "90days" 
  | "custom";

interface DateRangeFilterProps {
  onRangeChange?: (startDate: Date | null, endDate: Date | null) => void;
}

export function DateRangeFilter({ onRangeChange }: DateRangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>(
    (searchParams.get("range") as DateRangePreset) || "all"
  );
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(
    searchParams.get("startDate") ? format(new Date(searchParams.get("startDate")!), "yyyy-MM-dd") : ""
  );
  const [customEndDate, setCustomEndDate] = useState(
    searchParams.get("endDate") ? format(new Date(searchParams.get("endDate")!), "yyyy-MM-dd") : ""
  );

  const applyDateRange = (preset: DateRangePreset, start?: Date, end?: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    
    let startDate: Date | null = null;
    let endDate: Date | null = null;

    const now = new Date();
    
    switch (preset) {
      case "today":
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        break;
      case "3days":
        startDate = startOfDay(subDays(now, 3));
        endDate = endOfDay(now);
        break;
      case "7days":
        startDate = startOfDay(subDays(now, 7));
        endDate = endOfDay(now);
        break;
      case "14days":
        startDate = startOfDay(subDays(now, 14));
        endDate = endOfDay(now);
        break;
      case "30days":
        startDate = startOfDay(subDays(now, 30));
        endDate = endOfDay(now);
        break;
      case "90days":
        startDate = startOfDay(subDays(now, 90));
        endDate = endOfDay(now);
        break;
      case "custom":
        if (start && end) {
          startDate = startOfDay(start);
          endDate = endOfDay(end);
        } else {
          return; // Don't apply if custom dates not set
        }
        break;
      case "all":
        params.delete("startDate");
        params.delete("endDate");
        params.delete("range");
        router.replace(`${pathname}?${params.toString()}`);
        onRangeChange?.(null, null);
        return;
      default:
        params.delete("startDate");
        params.delete("endDate");
        params.delete("range");
        router.replace(`${pathname}?${params.toString()}`);
        onRangeChange?.(null, null);
        return;
    }

    if (startDate && endDate) {
      params.set("startDate", startDate.toISOString());
      params.set("endDate", endDate.toISOString());
      params.set("range", preset);
      params.set("page", "1"); // Reset to page 1 when changing date range
    }

    router.replace(`${pathname}?${params.toString()}`);
    onRangeChange?.(startDate, endDate);
  };

  const handlePresetChange = (preset: string) => {
    const rangePreset = preset as DateRangePreset;
    setSelectedPreset(rangePreset);
    
    if (rangePreset === "custom") {
      // If we already have dates in URL, show them
      const urlStartDate = searchParams.get("startDate");
      const urlEndDate = searchParams.get("endDate");
      if (urlStartDate && urlEndDate) {
        setCustomStartDate(format(new Date(urlStartDate), "yyyy-MM-dd"));
        setCustomEndDate(format(new Date(urlEndDate), "yyyy-MM-dd"));
      }
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      applyDateRange(rangePreset);
    }
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      
      if (start > end) {
        alert("Start date must be before end date");
        return;
      }
      
      applyDateRange("custom", start, end);
      setShowCustomPicker(false);
    }
  };

  const handleClearFilter = () => {
    setSelectedPreset("all" as DateRangePreset);
    setShowCustomPicker(false);
    setCustomStartDate("");
    setCustomEndDate("");
    applyDateRange("all" as DateRangePreset);
  };

  const getDisplayText = () => {
    if (selectedPreset === "custom" && customStartDate && customEndDate) {
      return `${format(new Date(customStartDate), "MMM d")} - ${format(new Date(customEndDate), "MMM d, yyyy")}`;
    }
    
    switch (selectedPreset) {
      case "today":
        return "Today";
      case "3days":
        return "Last 3 Days";
      case "7days":
        return "Last 7 Days";
      case "14days":
        return "Last 14 Days";
      case "30days":
        return "Last 30 Days";
      case "90days":
        return "Last 90 Days";
      case "custom":
        return "Custom Range";
      default:
        return "All Time";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <div className="flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-gray-500" />
        <Select
          value={selectedPreset}
          onValueChange={handlePresetChange}
          className="min-w-[180px]"
        >
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="3days">Last 3 Days</SelectItem>
          <SelectItem value="7days">Last 7 Days</SelectItem>
          <SelectItem value="14days">Last 14 Days</SelectItem>
          <SelectItem value="30days">Last 30 Days</SelectItem>
          <SelectItem value="90days">Last 90 Days</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </Select>
      </div>

      {showCustomPicker && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Start date"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="End date"
          />
          <Button
            size="sm"
            onClick={handleCustomDateApply}
            disabled={!customStartDate || !customEndDate}
          >
            Apply
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setShowCustomPicker(false);
              setCustomStartDate("");
              setCustomEndDate("");
            }}
          >
            Cancel
          </Button>
        </div>
      )}

      {selectedPreset !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {getDisplayText()}
          </span>
          <Button
            size="sm"
            variant="light"
            onClick={handleClearFilter}
          >
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}


