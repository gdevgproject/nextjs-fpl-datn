"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { Card, CardContent } from "@/components/ui/card";

interface JsonViewProps {
  data: any;
  level?: number;
  isLast?: boolean;
  property?: string;
}

export function JsonView({
  data,
  level = 0,
  isLast = true,
  property,
}: JsonViewProps) {
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const [copied, setCopied] = useState(false);
  const toast = useSonnerToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);

    toast.success("Đã sao chép vào clipboard");
  };

  // Function to determine the type of a value
  const getType = (value: any) => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
  };

  // Function to get text color based on value type
  const getTypeColor = (type: string) => {
    switch (type) {
      case "string":
        return "text-green-600 dark:text-green-400";
      case "number":
        return "text-blue-600 dark:text-blue-400";
      case "boolean":
        return "text-purple-600 dark:text-purple-400";
      case "null":
        return "text-gray-500";
      default:
        return "";
    }
  };

  // Function to format the display value
  const renderValue = (value: any, type: string) => {
    switch (type) {
      case "string":
        return `"${value}"`;
      case "null":
        return "null";
      default:
        return String(value);
    }
  };

  const type = getType(data);
  const isExpandable = type === "object" || type === "array";
  const isEmpty = isExpandable && Object.keys(data).length === 0;

  // If this is the root level, wrap in a card for better presentation
  if (level === 0) {
    return (
      <Card className="relative">
        <div className="absolute right-2 top-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleCopy(JSON.stringify(data, null, 2))}
            className="h-8 px-2 text-xs"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Đã sao chép" : "Sao chép"}
          </Button>
        </div>
        <CardContent className="p-4 pt-6 overflow-auto font-mono text-sm bg-muted/50 rounded-md">
          <div className="mt-4">
            <JsonViewContent
              data={data}
              level={0}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  // For nested levels, use regular rendering
  return (
    <div className="ml-4">
      {property && (
        <span className="font-semibold text-foreground">{property}: </span>
      )}
      <JsonViewContent
        data={data}
        level={level}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
    </div>
  );
}

// Extracted the content rendering to a separate component for cleaner code
function JsonViewContent({
  data,
  level,
  isExpanded,
  setIsExpanded,
}: {
  data: any;
  level: number;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
}) {
  const type = typeof data;

  // Handle primitive types directly
  if (data === null) {
    return <span className="text-gray-500">null</span>;
  }

  if (type !== "object" || data === null) {
    const color =
      type === "string"
        ? "text-green-600 dark:text-green-400"
        : type === "number"
        ? "text-blue-600 dark:text-blue-400"
        : type === "boolean"
        ? "text-purple-600 dark:text-purple-400"
        : "";

    return (
      <span className={color}>
        {type === "string" ? `"${data}"` : String(data)}
      </span>
    );
  }

  const isArray = Array.isArray(data);
  const isEmpty = Object.keys(data).length === 0;

  if (isEmpty) {
    return <span>{isArray ? "[]" : "{}"}</span>;
  }

  if (!isExpanded) {
    return (
      <>
        <button
          onClick={() => setIsExpanded(true)}
          className="inline-flex items-center text-xs hover:bg-accent p-0.5 rounded"
        >
          <ChevronRight className="h-3 w-3 inline mr-1" />
          {isArray ? "[...]" : "{...}"}
        </button>
      </>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsExpanded(false)}
        className="inline-flex items-center text-xs hover:bg-accent p-0.5 rounded"
      >
        <ChevronDown className="h-3 w-3 inline mr-1" />
        {isArray ? "[" : "{"}
      </button>
      <div className="ml-5 border-l pl-2 border-gray-200 dark:border-gray-700">
        {Object.entries(data).map(([key, value], i, arr) => (
          <div key={key} className="my-1">
            {isArray ? (
              <JsonView
                data={value}
                level={level + 1}
                isLast={i === arr.length - 1}
              />
            ) : (
              <JsonView
                data={value}
                property={key}
                level={level + 1}
                isLast={i === arr.length - 1}
              />
            )}
          </div>
        ))}
      </div>
      <span>{isArray ? "]" : "}"}</span>
    </div>
  );
}
