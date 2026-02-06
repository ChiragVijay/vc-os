"use client";

import { useState, useRef } from "react";
import { Download, FileText, Printer, ChevronDown } from "lucide-react";

export type ExportOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void | Promise<void>;
};

type ExportButtonProps = {
  options: ExportOption[];
  label?: string;
  className?: string;
};

export const ExportButton = ({ options, label = "Export", className = "" }: ExportButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleOptionClick = async (option: ExportOption) => {
    setIsExporting(option.id);
    try {
      await option.onClick();
    } finally {
      setIsExporting(null);
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-[0.1em] border border-vc-border bg-white hover:bg-vc-hover hover:border-vc-primary/30 transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Download className="w-3.5 h-3.5" />
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 min-w-[180px] bg-white border border-vc-border shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handleOptionClick(option)}
              disabled={isExporting !== null}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-vc-primary hover:bg-vc-hover transition-colors disabled:opacity-50"
            >
              <span className="text-vc-secondary">{option.icon}</span>
              <span>{option.label}</span>
              {isExporting === option.id && (
                <span className="ml-auto text-xs text-vc-secondary">...</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const defaultExportIcons = {
  markdown: <FileText className="w-4 h-4" />,
  pdf: <Printer className="w-4 h-4" />,
};
