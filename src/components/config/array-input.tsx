"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ArrayInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export function ArrayInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
}: ArrayInputProps) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = input.trim().toUpperCase();
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && input === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function handleRemove(item: string) {
    onChange(value.filter((v) => v !== item));
  }

  return (
    <div className="flex flex-wrap gap-1.5 p-2 rounded-md border border-input bg-background min-h-[38px]">
      {value.map((item) => (
        <Badge key={item} variant="secondary" className="gap-1 text-xs">
          {item}
          <button
            type="button"
            onClick={() => handleRemove(item)}
            className="ml-0.5 hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        className="border-0 bg-transparent p-0 h-6 text-sm shadow-none focus-visible:ring-0 flex-1 min-w-[80px]"
      />
    </div>
  );
}
