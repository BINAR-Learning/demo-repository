"use client";
import React from "react";


import { useEffect, useState } from "react";
import { Plus, Trash2, SparklesIcon, Dices, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ShareUrlButton from "@/components/share-url-button";

import { cn, loadSharedData, scrollToBottom } from "@/lib/utils";
import { useDecisionTool } from "@/hooks/useDecisionTool";
import { Tools } from "@/lib/toolsConfig";
import { RandomDecisionData } from "@/lib/toolsConfigType";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { LoadingOverlay } from "@/components/loading-overlay";
import { useIsMobile } from "@/hooks/useBreakpoint";

const tool: Tools = "randomDecision";

export default function RandomDecisionPage() {
  const router = useRouter();
  const t = useTranslations();
  const tRandom = useTranslations("randomDecision");
  const tCommon = useTranslations("common");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data,
    setData,
    generating,
    generateFromContext,
    loading,
    resetData,
    updateLocalStorage,
    showSampleData,
  } = useDecisionTool<RandomDecisionData>(tool);

  const searchParams = useSearchParams();
  const [paramContext, setParamContext] = useState<string | null>(searchParams.get("context"));

  useEffect(() => {
    if (paramContext) {
      resetData();
      setData((prevData) => ({
        ...prevData,
        decisionContext: paramContext,
      }));

      generateFromContext(paramContext);

      const currentUrl = window.location.href;
      const urlWithoutContext = currentUrl.replace(/[?&]context=[^&]*/, "");
      router.replace(urlWithoutContext);
      setParamContext(null);
    }
  }, [paramContext, setData, resetData, generateFromContext, router]);

  const { decisionContext, options, selectedOption, isSpinning, showResult } = data;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sharedData = loadSharedData();
      if (sharedData) {
        localStorage.setItem(tool, JSON.stringify(sharedData));
        updateLocalStorage();
        try {
          if (router && typeof router.replace === "function") {
            router.replace(window.location.pathname);
          } else {
            window.location.replace(window.location.pathname);
          }
        } catch (error) {
          console.error("Navigation error:", error);
        }
      }
    }
  }, [router, updateLocalStorage]);

  const [newOptionText, setNewOptionText] = useState("");

  // ----------------------------
  // 1) Helper Functions
  // ----------------------------
  const setDecisionContext = (val: string) =>
    setData((prev) => ({
      ...prev,
      decisionContext: val,
      showResult: false,
    }));

  // ----------------------------
  // 2) Option Management
  // ----------------------------
  const handleAddOption = () => {
    if (!newOptionText.trim()) return;
    setData((prev) => ({
      ...prev,
      options: [...prev.options, newOptionText],
      showResult: false,
    }));
    setNewOptionText("");
  };

  const removeOption = (index: number) => {
    setData((prev) => {
      const newArr = [...prev.options];
      newArr.splice(index, 1);
      return { ...prev, options: newArr, showResult: false };
    });
  };

  // ----------------------------
  // 3) Decision Method (Simple Random)
  // ----------------------------
  const pickRandom = () => {
    if (options.length < 1) return;

    // Start spinning
    setData((prev) => ({
      ...prev,
      isSpinning: true,
      selectedOption: null,
      showResult: false,
    }));

    const idx = Math.floor(Math.random() * options.length);
    // Stop spinning and show result
    setTimeout(() => {
      setData((prev) => ({
        ...prev,
        isSpinning: false,
        selectedOption: options[idx],
        showResult: true,
      }));
    }, 2000);

  };

  const isMobile = useIsMobile();
  useEffect(() => {
    if (data.showResult && isMobile) {
      scrollToBottom();
    }
  }, [data.showResult]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="container mx-auto py-8">
        {/* Page header */}
        <PageHeader
          title={t("tools.randomDecision.title")}
          onReset={resetData}
          backHref="/"
          backText={tCommon("back")}
          resetConfirmationTitle={tCommon("resetConfirmation.title")}
          resetConfirmationDescription={tCommon("resetConfirmation.description")}
          resetConfirmationCancel={tCommon("resetConfirmation.cancel")}
          resetConfirmationConfirm={tCommon("resetConfirmation.confirm")}
          tool={tool}
        />

        {/* Title & Context Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{tRandom("decisionContext")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              maxLength={200}
              className="mt-1"
              placeholder={tRandom("contextPlaceholder")}
              value={decisionContext}
              onChange={(e) => setDecisionContext(e.target.value)}
            />
            <div className="flex flex-wrap mt-3 gap-2 items-center">
              <Button
                onClick={() => generateFromContext(decisionContext)}
                disabled={generating || !decisionContext}
                className="w-full sm:w-auto"
              >
                <SparklesIcon className="mr-2 h-4 w-4" />
                {generating ? tCommon("generating") : tRandom("generateAi")}
              </Button>

              <div className="flex items-center flex-grow sm:flex-grow-0">
                <div className="h-0.5 bg-gray-200 w-full"></div>
                <p className="text-sm text-muted-foreground mx-2">
                  {tCommon("or")}
                </p>
                <div className="h-0.5 bg-gray-200 w-full"></div>
              </div>

              <ConfirmationDialog
                title={tCommon("exampleConfirmation.title")}
                description={tCommon("exampleConfirmation.description")}
                cancelText={tCommon("exampleConfirmation.cancel")}
                confirmText={tCommon("exampleConfirmation.confirm")}
                triggerText={tCommon("showSample")}
                triggerDisabled={generating}
                onConfirm={() => showSampleData(t)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Options & Decision Method */}
        <div className={cn("grid gap-8 my-8 md:grid-cols-2", showResult || isSpinning ? "" : "md:grid-cols-1")}>
          <Card>
            <CardHeader>
              <CardTitle>{tRandom("options.title")}</CardTitle>
              <CardDescription>
                {tRandom("options.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {options.map((option, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex-1 rounded border p-2",
                        selectedOption === option &&
                        showResult &&
                        "border-green-500 bg-green-500/10"
                      )}
                    >
                      {option}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {/* New Option Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder={tRandom("options.placeholder")}
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddOption();
                    }}
                  />
                  <Button onClick={handleAddOption}>
                    <Plus className="mr-2 h-4 w-4" />
                    {tRandom("options.add")}
                  </Button>
                </div>
              </div>
              <Button
                size="lg"
                onClick={pickRandom}
                disabled={options.length < 1 || isSpinning}
                className="h-16 w-full mt-8"
              >
                <Dices className="mr-2 h-5 w-5" />
                {tRandom("decisionMethod.simpleRandom")}
              </Button>
            </CardContent>
          </Card>

          {/* Show selected option or spinning indicator */}
          {(isSpinning || showResult) && (
            <Card className="border-green-500 rounded-t-lg h-fit">
              <CardHeader
                className="bg-green-50 dark:bg-green-950 rounded-t-lg">
                <CardTitle className="text-green-700 dark:text-green-300">
                  {tRandom("result.selectedOption")}
                </CardTitle>
                <CardDescription>
                  {tRandom("result.selectedDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {isSpinning && (
                  <div className="flex justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                )}
                {!isSpinning && showResult && selectedOption && (
                  <p className="text-xl font-bold">{selectedOption}</p>
                )}
              </CardContent>
            </Card>
          )}

        </div>

        {showResult && (
          <ShareUrlButton
            tool={tool}
            label="Share Result URL"
            warningMessage={tCommon("shareNote")}
            size="lg"
            variant="default"
            width="w-full"
            icon={<Share2 />}
            bg="bg-gradient-to-r from-blue-500 via-teal-500 via-green-500 via-teal-500 to-blue-500 text-white shadow-lg hover:brightness-110"
            animationType="animate-jump-wiggle-slight"
          />
        )}
      </div>

      {/* Loading Overlay if AI generating or loading */}
      {(loading || generating) && (
        <LoadingOverlay
          text={generating ? tCommon("generating") : tCommon("loading")}
        />
      )}
    </>
  );
}
