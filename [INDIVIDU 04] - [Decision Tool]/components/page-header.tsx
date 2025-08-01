"use client";
import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Tools } from "@/lib/toolsConfig";
import ShareUrlButton from "./share-url-button";
import { ConfirmationDialog } from "./confirmation-dialog";

interface PageHeaderProps {
  title: string;
  onReset: () => void;
  backHref?: string;
  backText?: string;
  resetConfirmationTitle?: string;
  resetConfirmationDescription?: string;
  resetConfirmationCancel?: string;
  resetConfirmationConfirm?: string;
  tool: Tools;
}

export function PageHeader({
  title,
  onReset,
  backHref = "/",
  backText = "Back",
  resetConfirmationTitle = "Reset Confirmation",
  resetConfirmationDescription = "Are you sure you want to reset?",
  resetConfirmationCancel = "Cancel",
  resetConfirmationConfirm = "Confirm",
  tool,
}: PageHeaderProps) {
  const t = useTranslations();

  return (
    <div className="mb-4 md:mb-6 lg:mb-8 space-y-4">
      <div className="flex items-center">
        <Button variant="outline" size="sm" asChild>
          <Link href={backHref}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">{backText}</span>
          </Link>
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words hyphens-auto">
          {title}
        </h1>
        <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
          <ShareUrlButton
            tool={tool}
            label="Share URL"
            warningMessage={t("common.shareNote")}
          />
          <ConfirmationDialog
            title={resetConfirmationTitle}
            description={resetConfirmationDescription}
            cancelText={resetConfirmationCancel}
            confirmText={resetConfirmationConfirm}
            triggerText="Reset"
            onConfirm={onReset}
          />
        </div>
      </div>
    </div>
  );
}
