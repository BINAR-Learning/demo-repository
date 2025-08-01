"use client";
import React from "react";


import { useEffect, useState } from "react";
import { Plus, Trash2, SparklesIcon, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ShareUrlButton from "@/components/share-url-button";

import { cn, loadSharedData } from "@/lib/utils";
import { useDecisionTool } from "@/hooks/useDecisionTool";
import { SwotAnalysisData, SwotItem } from "@/lib/toolsConfigType"; // or define inline
import { Tools } from "@/lib/toolsConfig";
import { useRouter, useSearchParams } from 'next/navigation';
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Textarea } from "@/components/ui/textarea";
import { LoadingOverlay } from "@/components/loading-overlay";

// Identify which tool we want from the config
const tool: Tools = "swotAnalysis";

export default function SwotAnalysisPage() {
  const router = useRouter();
  const t = useTranslations();
  const tSwot = useTranslations("swot");
  const tCommon = useTranslations("common");

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pull in data & methods from the custom hook
  const {
    data,
    setData,
    generating,          // relevant if you do AI generation
    generateFromContext, // relevant if you do AI generation
    loading,
    handleShowResult,    // if you want to gate final analysis behind "showResult"
    resetData,
    updateLocalStorage,
    showSampleData
  } = useDecisionTool<SwotAnalysisData>(tool);

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


  // Destructure fields from the single `data` object
  const {
    decisionContext,
    strengths,
    weaknesses,
    opportunities,
    threats,
    showResult,
  } = data;

  // Local states for new item text and active category (not persisted)
  const [newItem, setNewItem] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "strengths" | "weaknesses" | "opportunities" | "threats"
  >("strengths");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sharedData = loadSharedData();
      if (sharedData) {
        localStorage.setItem(tool, JSON.stringify(sharedData));
        updateLocalStorage();

        try {
          if (router && typeof router.replace === 'function') {
            router.replace(window.location.pathname);
          } else {
            window.location.replace(window.location.pathname);
          }
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }
    }
  }, []);

  // ---- Update top-level fields in data ----
  const handleContextChange = (val: string) =>
    setData({ ...data, decisionContext: val, showResult: false });

  // ---- CRUD for each category ----
  const addItem = () => {
    if (!newItem.trim()) return;
    const newId = `${activeCategory[0]}${Date.now()}`;
    const newObj: SwotItem = { id: newId, text: newItem.trim() };

    switch (activeCategory) {
      case "strengths":
        setData({ ...data, strengths: [...strengths, newObj], showResult: false });
        break;
      case "weaknesses":
        setData({ ...data, weaknesses: [...weaknesses, newObj], showResult: false });
        break;
      case "opportunities":
        setData({ ...data, opportunities: [...opportunities, newObj], showResult: false });
        break;
      case "threats":
        setData({ ...data, threats: [...threats, newObj], showResult: false });
        break;
    }
    setNewItem("");
  };

  const removeItem = (
    category: "strengths" | "weaknesses" | "opportunities" | "threats",
    itemId: string
  ) => {
    switch (category) {
      case "strengths":
        setData({
          ...data,
          strengths: strengths.filter((i) => i.id !== itemId),
          showResult: false,
        });
        break;
      case "weaknesses":
        setData({
          ...data,
          weaknesses: weaknesses.filter((i) => i.id !== itemId),
          showResult: false,
        });
        break;
      case "opportunities":
        setData({
          ...data,
          opportunities: opportunities.filter((i) => i.id !== itemId),
          showResult: false,
        });
        break;
      case "threats":
        setData({
          ...data,
          threats: threats.filter((i) => i.id !== itemId),
          showResult: false,
        });
        break;
    }
  };

  if (!mounted) {
    return null;
  }

  // ---- Render Page ----
  return (
    <>
      <div className="container mx-auto py-8">
        <PageHeader
          title={t("tools.swotAnalysis.title")}
          onReset={resetData}
          backHref="/"
          backText={tCommon("back")}
          resetConfirmationTitle={tCommon("resetConfirmation.title")}
          resetConfirmationDescription={tCommon("resetConfirmation.description")}
          resetConfirmationCancel={tCommon("resetConfirmation.cancel")}
          resetConfirmationConfirm={tCommon("resetConfirmation.confirm")}
          tool={tool}
        />

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{tSwot("context")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              maxLength={200}
              className="mt-1"
              placeholder={tSwot("contextPlaceholder")}
              value={decisionContext}
              onChange={(e) => handleContextChange(e.target.value)}
            />

            <div className="flex flex-wrap mt-3 gap-2 items-center">
              <Button
                onClick={() => generateFromContext(data.decisionContext)}
                disabled={generating || !data.decisionContext}
                className="w-full sm:w-auto"
              >
                <SparklesIcon />
                {generating ? tCommon("generating") : tSwot("generateAi")}
              </Button>
              <div className="flex items-center flex-grow sm:flex-grow-0">
                <div className="h-0.5 bg-gray-200 w-full"></div>
                <p className="text-sm text-muted-foreground mx-2">{tCommon("or")}</p>
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

        {!showResult && (
          <div className="grid gap-4 my-8 md:grid-cols-2">
            {/* Strengths */}
            <Card className="border-green-500">
              <CardHeader className="bg-green-50 dark:bg-green-950 rounded-t-xl">
                <CardTitle className="text-green-700 dark:text-green-300">
                  {tSwot("strengths.title")}
                </CardTitle>
                <CardDescription>{tSwot("strengths.description")}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {strengths.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="flex-1 rounded border bg-green-50 p-2 dark:bg-green-950/50">
                        {item.text}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem("strengths", item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {activeCategory === "strengths" ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder={tSwot("strengths.placeholder")}
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addItem()}
                      />
                      <Button onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" />
                        {tSwot("strengths.addStrength")}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveCategory("strengths")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {tSwot("strengths.addStrength")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card className="border-red-500">
              <CardHeader className="bg-red-50 dark:bg-red-950 rounded-t-xl">
                <CardTitle className="text-red-700 dark:text-red-300">
                  {tSwot("weaknesses.title")}
                </CardTitle>
                <CardDescription>{tSwot("weaknesses.description")}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {weaknesses.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="flex-1 rounded border bg-red-50 p-2 dark:bg-red-950/50">
                        {item.text}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem("weaknesses", item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {activeCategory === "weaknesses" ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder={tSwot("weaknesses.placeholder")}
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addItem()}
                      />
                      <Button onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" />
                        {tSwot("weaknesses.addWeakness")}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveCategory("weaknesses")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {tSwot("weaknesses.addWeakness")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Opportunities */}
            <Card className="border-blue-500">
              <CardHeader className="bg-blue-50 dark:bg-blue-950 rounded-t-xl">
                <CardTitle className="text-blue-700 dark:text-blue-300">
                  {tSwot("opportunities.title")}
                </CardTitle>
                <CardDescription>{tSwot("opportunities.description")}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {opportunities.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="flex-1 rounded border bg-blue-50 p-2 dark:bg-blue-950/50">
                        {item.text}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem("opportunities", item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {activeCategory === "opportunities" ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder={tSwot("opportunities.placeholder")}
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addItem()}
                      />
                      <Button onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" />
                        {tSwot("opportunities.addOpportunity")}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveCategory("opportunities")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {tSwot("opportunities.addOpportunity")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Threats */}
            <Card className="border-yellow-500">
              <CardHeader className="bg-yellow-50 dark:bg-yellow-950 rounded-t-xl">
                <CardTitle className="text-yellow-700 dark:text-yellow-300">
                  {tSwot("threats.title")}
                </CardTitle>
                <CardDescription>{tSwot("threats.description")}</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {threats.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="flex-1 rounded border bg-yellow-50 p-2 dark:bg-yellow-950/50">
                        {item.text}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeItem("threats", item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {activeCategory === "threats" ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder={tSwot("threats.placeholder")}
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addItem()}
                      />
                      <Button onClick={addItem}>
                        <Plus className="mr-2 h-4 w-4" />
                        {tSwot("threats.addThreat")}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveCategory("threats")}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {tSwot("threats.addThreat")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {strengths.length + weaknesses.length + opportunities.length + threats.length > 0 && (
          <ShareUrlButton
            tool={tool}
            label="Share SWOT URL"
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
