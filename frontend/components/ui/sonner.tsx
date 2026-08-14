"use client";

import {
  CheckCircle2,
  CircleAlert,
  Info,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="top-right"
      expand={false}
      visibleToasts={4}
      closeButton
      gap={10}
      offset={{ top: 88, right: 18 }}
      mobileOffset={{ top: 84, right: 12, left: 12 }}
      toastOptions={{
        duration: 4500,
        classNames: {
          toast:
            "group !w-full !rounded-2xl !border-[#d9e4da] !bg-white !px-4 !py-3.5 !font-sans !text-[#213c2b] !shadow-[0_18px_48px_rgba(22,61,40,0.16)]",
          title: "!text-[13px] !font-bold !tracking-[-0.01em] !text-[#213c2b]",
          description: "!mt-0.5 !text-xs !leading-5 !text-[#68766d]",
          icon: "!mr-1",
          closeButton:
            "!left-auto !right-2 !top-2 !h-6 !w-6 !translate-x-0 !translate-y-0 !border-[#dce5dd] !bg-[#f6f9f5] !text-[#69766d] hover:!bg-[#e9f3e9] hover:!text-[#17643a]",
          actionButton:
            "!rounded-lg !bg-[#17643a] !px-3 !text-xs !font-bold !text-white hover:!bg-[#11502e]",
          cancelButton:
            "!rounded-lg !bg-[#edf2ec] !px-3 !text-xs !font-bold !text-[#405548] hover:!bg-[#e2e9e1]",
          success: "!border-l-[3px] !border-l-[#2d8a50]",
          error: "!border-l-[3px] !border-l-[#dc4a4a]",
          warning: "!border-l-[3px] !border-l-[#d79524]",
          info: "!border-l-[3px] !border-l-[#3f7cac]",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-[18px] w-[18px] text-[#2d8a50]" />,
        info: <Info className="h-[18px] w-[18px] text-[#3f7cac]" />,
        warning: <TriangleAlert className="h-[18px] w-[18px] text-[#d79524]" />,
        error: <CircleAlert className="h-[18px] w-[18px] text-[#dc4a4a]" />,
        loading: <LoaderCircle className="h-[18px] w-[18px] animate-spin text-[#2d8a50]" />,
      }}
      {...props}
    />
  );
}
