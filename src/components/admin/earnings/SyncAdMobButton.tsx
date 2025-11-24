"use client";

import { useState, useTransition, useEffect } from "react";
import { Button, Select, SelectItem } from "@tremor/react";
import { RefreshCw, Check, AlertCircle, Calendar } from "lucide-react";
import { syncAdMobData } from "@/app/actions/earnings-analytics";

export function SyncAdMobButton() {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("30");

  const handleSync = (days?: number) => {
    const daysToSync = days ?? parseInt(duration);
    
    startTransition(async () => {
      setStatus("idle");
      setMessage("");
      
      const result = await syncAdMobData(daysToSync);
      
      if (result.success) {
        setStatus("success");
        setMessage(`Synced ${result.count} records`);
        // Reset status after 3 seconds
        setTimeout(() => {
            setStatus("idle");
            setMessage("");
        }, 3000);
      } else {
        setStatus("error");
        setMessage(typeof result.error === 'string' ? result.error : "Sync failed");
      }
    });
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    // Auto-sync when duration changes
    handleSync(parseInt(value));
  };

  return (
    <div className="flex items-center gap-3">
      {status === "error" && (
        <span className="text-sm text-red-500 flex items-center gap-1 animate-in fade-in">
          <AlertCircle className="w-4 h-4" /> 
          <span className="max-w-[200px] truncate" title={message}>{message}</span>
        </span>
      )}
      {status === "success" && (
        <span className="text-sm text-emerald-500 flex items-center gap-1 animate-in fade-in">
          <Check className="w-4 h-4" /> {message}
        </span>
      )}
      
      <div className="w-40">
        <Select 
            value={duration} 
            onValueChange={handleDurationChange}
            disabled={isPending}
            icon={Calendar}
        >
            <SelectItem value="7">Last 7 Days</SelectItem>
            <SelectItem value="14">Last 14 Days</SelectItem>
            <SelectItem value="30">Last 30 Days</SelectItem>
            <SelectItem value="60">Last 60 Days</SelectItem>
            <SelectItem value="90">Last 90 Days</SelectItem>
        </Select>
      </div>

      <Button
        icon={RefreshCw}
        size="sm"
        variant="secondary"
        loading={isPending}
        onClick={() => handleSync()}
        disabled={isPending}
      >
        {isPending ? "Syncing..." : "Sync AdMob"}
      </Button>
    </div>
  );
}
