"use client";
import React from "react";


import { useEffect, useState } from "react";
import { Dices, Plus, Trash2, SparklesIcon, Share2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import ShareUrlButton from "@/components/share-url-button";

import { cn, loadSharedData, scrollToBottom } from "@/lib/utils";
import { useDecisionTool } from "@/hooks/useDecisionTool";
import { WeightedOption, WeightedRandomData } from "@/lib/toolsConfigType";
import { Tools } from "@/lib/toolsConfig";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Textarea } from "@/components/ui/textarea";
import { LoadingOverlay } from "@/components/loading-overlay";
import { useIsMobile } from "@/hooks/useBreakpoint";

const tool: Tools = "weightedRandom";

export default function WeightedRandomPage() {
  const router = useRouter();
  const t = useTranslations();
  const tWeightedRandom = useTranslations("weightedRandom");
  const tCommon = useTranslations("common");

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Access the data & methods from our custom hook
  const {
    data,
    setData,
    generating,
    generateFromContext,
    loading,
    resetData,
    updateLocalStorage,
    showSampleData,
  } = useDecisionTool<WeightedRandomData>(tool);

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

  const {
    decisionContext,
    options,
    showProbabilities,
    selectedOption,
    isSpinning,
    showResult,
  } = data;

  // Local state for "Add Option"
  const [newOptionText, setNewOptionText] = useState("");

  // If user visited a shared URL, store data & remove query
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

  const isMobile = useIsMobile();
  useEffect(() => {
    if (data.showResult && isMobile) {
      scrollToBottom();
    }
  }, [data.showResult]);

  if (!mounted) {
    return null;
  }

  // ---------------------
  // 1) Helpers & Updaters
  // ---------------------
  const setDecisionContextLocal = (val: string) =>
    setData((prev) => ({ ...prev, decisionContext: val, showResult: false }));

  const setShowProbabilitiesLocal = (val: boolean) =>
    setData((prev) => ({ ...prev, showProbabilities: val, showResult: false }));

  // Compute total weight
  const calculateTotalWeight = () => {
    return options.reduce((sum, o) => sum + o.weight, 0);
  };

  // Compute probability (as a percentage) for a given weight
  const calculateProbability = (weight: number) => {
    const total = calculateTotalWeight();
    return total > 0 ? (weight / total) * 100 : 0;
  };

  // ---------------------
  // 2) Weighted Pick
  // ---------------------
  const pickWeightedRandom = () => {
    if (options.length < 1) return;

    // Start spinning
    setData((prev) => ({
      ...prev,
      isSpinning: true,
      selectedOption: null,
      showResult: false,
    }));


    setTimeout(() => {
      const totalWeight = calculateTotalWeight();
      let random = Math.random() * totalWeight;

      let picked: WeightedOption | null = null;
      for (const opt of options) {
        random -= opt.weight;
        if (random <= 0) {
          picked = opt;
          break;
        }
      }

      setData((prev) => ({
        ...prev,
        isSpinning: false,
        selectedOption: picked ?? null,
        showResult: true,
      }));
    }, 2000);
  };

  // ---------------------
  // 3) CRUD for options
  // ---------------------
  const addOption = () => {
    if (!newOptionText.trim()) return;
    const newId = `${options.length + 1}`;
    const newOpt: WeightedOption = {
      id: newId,
      text: newOptionText.trim(),
      weight: 5, // default weight
    };
    setData((prev) => ({
      ...prev,
      options: [...prev.options, newOpt],
      showResult: false,
    }));
    setNewOptionText("");
  };

  const removeOption = (id: string) => {
    setData((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id),
      showResult: false,
    }));
  };

  const updateOptionWeight = (id: string, weight: number) => {
    setData((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === id ? { ...opt, weight } : opt
      ),
      showResult: false,
    }));
  };

  // ---------------------
  // 4) Render
  // ---------------------
  return (
    <>
      <div className="container mx-auto py-8">
        {/* Page header */}
        <PageHeader
          title={t("tools.weightedRandom.title")}
          onReset={resetData}
          backHref="/"
          backText={tCommon("back")}
          resetConfirmationTitle={tCommon("resetConfirmation.title")}
          resetConfirmationDescription={tCommon("resetConfirmation.description")}
          resetConfirmationCancel={tCommon("resetConfirmation.cancel")}
          resetConfirmationConfirm={tCommon("resetConfirmation.confirm")}
          tool={tool}
        />

        {/* Context card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{tWeightedRandom("decisionContext")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              maxLength={200}
              className="mt-1"
              placeholder={tWeightedRandom("contextPlaceholder")}
              value={decisionContext}
              onChange={(e) => setDecisionContextLocal(e.target.value)}
            />
            <div className="flex flex-wrap mt-3 gap-2 items-center">
              <Button
                onClick={() => generateFromContext(decisionContext)}
                disabled={generating || !decisionContext}
                className="w-full sm:w-auto"
              >
                <SparklesIcon className="mr-2 h-4 w-4" />
                {generating ? tCommon("generating") : tWeightedRandom("generateAi")}
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

        {/* Two-column layout if result is shown or spinning; otherwise single column */}
        <div
          className={cn(
            "grid gap-8 my-8 md:grid-cols-2",
            showResult || isSpinning ? "" : "md:grid-cols-1"
          )}
        >
          {/* Options & Weights Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{tWeightedRandom("options.title")}</CardTitle>
                  <CardDescription>
                    {tWeightedRandom("options.description")}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowProbabilitiesLocal(!showProbabilities)}
                >
                  {showProbabilities
                    ? tWeightedRandom("options.hideProbabilities")
                    : tWeightedRandom("options.showProbabilities")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {options.map((option) => (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex-1 rounded border p-2",
                          selectedOption?.id === option.id &&
                          showResult &&
                          "border-green-500 bg-green-500/10"
                        )}
                      >
                        {option.text}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(option.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label className="w-24">
                        {tWeightedRandom("options.weightLabel")}: {option.weight}
                      </Label>
                      <Slider
                        value={[option.weight]}
                        min={1}
                        max={10}
                        step={1}
                        className="flex-1"
                        onValueChange={(val) =>
                          updateOptionWeight(option.id, val[0])
                        }
                      />
                      {showProbabilities && (
                        <div className="w-16 text-right text-sm">
                          {calculateProbability(option.weight).toFixed(1)}%
                        </div>
                      )}
                    </div>
                    {showProbabilities && (
                      <Progress
                        value={calculateProbability(option.weight)}
                        className="h-2"
                      />
                    )}
                  </div>
                ))}

                {/* Add New Option */}
                <div className="flex gap-2">
                  <Input
                    placeholder={tWeightedRandom("options.placeholder")}
                    value={newOptionText}
                    onChange={(e) => setNewOptionText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addOption()}
                  />
                  <Button onClick={addOption}>
                    <Plus className="mr-2 h-4 w-4" />
                    {tWeightedRandom("options.add")}
                  </Button>
                </div>
              </div>

              <Button
                size="lg"
                onClick={pickWeightedRandom}
                disabled={options.length < 1 || isSpinning}
                className="h-16 w-full mt-8"
              >
                <Dices className="mr-2 h-5 w-5" />
                {tWeightedRandom("decisionMethod.pickWeighted")}
              </Button>
            </CardContent>
          </Card>

          {/* Result Card (only if spinning or we have a selected option) */}
          {(isSpinning || (selectedOption && showResult)) && (
            <Card className="border-green-500 rounded-t-lg h-fit">
              <CardHeader className="bg-green-50 dark:bg-green-950 rounded-t-lg">
                <CardTitle className="text-green-700 dark:text-green-300">
                  {tWeightedRandom("result.selectedOption")}
                </CardTitle>
                <CardDescription>
                  {tWeightedRandom("result.selectedDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {isSpinning && (
                  <div className="flex justify-center mb-2">
                    <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary"></div>
                  </div>
                )}
                {!isSpinning && selectedOption && showResult && (
                  <>
                    <p className="text-xl font-bold">{selectedOption.text}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {tWeightedRandom("result.probability", {
                        probability: calculateProbability(
                          selectedOption.weight
                        ).toFixed(1),
                      })}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Share Button (if you want to show after picking) */}
        {showResult && selectedOption && (
          <ShareUrlButton
            tool={tool}
            label="Share Weighted Random URL"
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
