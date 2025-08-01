"use client";


import React from 'react';
import { useState, useEffect, useRef, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn, createShareUrl, getDataByTool } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { Tools } from "@/lib/toolsConfig";

interface ShareUrlButtonProps {
  tool: Tools;
  label?: string;
  warningMessage?: string;
  size?: "sm" | "lg";
  variant?: "outline" | "secondary" | "default";
  width?: string;
  icon?: ReactNode;
  bg?: string;
  animationType?: string
}

export default function ShareUrlButton({
  tool,
  label = "Share URL",
  warningMessage,
  size = "sm",
  variant = "outline",
  width = "w-full sm:w-auto",
  icon = <Copy/>,
  bg = "",
  animationType = "animate-jump-wiggle-big"
}: ShareUrlButtonProps) {
  const [copySuccess, setCopySuccess] = useState("");
  const { toast } = useToast();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (buttonRef.current) {
        buttonRef.current.classList.add(animationType);
        const handleAnimationEnd = () => {
          buttonRef.current?.classList.remove(animationType);
        };
        buttonRef.current.addEventListener("animationend", handleAnimationEnd, { once: true });
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const handleShare = () => {
    const freshData = getDataByTool(tool);
    const shareUrl = createShareUrl(freshData);
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setCopySuccess("Share URL copied to clipboard!");
        toast({
          title: "Success!",
          description: "Share URL copied to clipboard!",
          className: "bg-green-500 text-white",
          duration: 1500,
        });
        setTimeout(() => setCopySuccess(""), 3000);
      })
      .catch((err) => {
        console.error("Failed to copy the URL:", err);
        toast({
          title: "Error",
          description: "Failed to copy the URL.",
          variant: "destructive",
          duration: 1500,
        });
      });
  };
  
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Button variant={variant} size={size} 
          className={cn(width, bg)} 
          onClick={handleShare} 
          ref={buttonRef}>
          {icon}
          {label}
        </Button>
      </TooltipTrigger>
      {warningMessage && <TooltipContent>{warningMessage}</TooltipContent>}
    </Tooltip>
  );
}
