"use client"; 
import React from "react";


import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Plus, Trash2, Share2, SparklesIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeeResultButton } from "@/components/see-result-button";
import ShareUrlButton from "@/components/share-url-button";

import { loadSharedData } from "@/lib/utils";
import { useDecisionTool } from "@/hooks/useDecisionTool";
import { CostBenefitData, CostBenefitItem } from "@/lib/toolsConfigType";
import { Tools } from "@/lib/toolsConfig";
import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Textarea } from "@/components/ui/textarea";
const tool: Tools = "costBenefit";

export default function CostBenefitPage() {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const tCostBenefit = useTranslations("costBenefit");
  const router = useRouter();

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pull in data & methods from our custom hook
  const {
    data,
    setData,
    generating,
    generateFromContext,
    loading,
    handleShowResult,
    resetData,
    updateLocalStorage,
    showSampleData
  } = useDecisionTool<CostBenefitData>(tool);

  // Pull out fields for brevity
  const {
    decisionContext,
    costs,
    benefits,
    discountRate,
    activeTab,
    showResult
  } = data;

  // Local states for new cost/benefit items
  const [newItemText, setNewItemText] = useState("");
  const [newItemValue, setNewItemValue] = useState<number>(0);
  const [newItemIsMonetary, setNewItemIsMonetary] = useState<boolean>(true);
  const [newItemTimeframe, setNewItemTimeframe] = useState<"short" | "medium" | "long">("medium");

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

  // Helpers to update the data via setData
  const addItem = () => {
    if (!newItemText.trim()) return;

    const newItem: CostBenefitItem = {
      id: `${activeTab === "costs" ? "c" : "b"}-${Date.now()}`,
      description: newItemText,
      value: newItemValue,
      isMonetary: newItemIsMonetary,
      timeframe: newItemTimeframe,
    };

    if (activeTab === "costs") {
      setData({ ...data, costs: [...costs, newItem] });
    } else {
      setData({ ...data, benefits: [...benefits, newItem] });
    }

    // Reset local new-item form
    setNewItemText("");
    setNewItemValue(0);
  };

  const removeItem = (id: string) => {
    if (id.startsWith("c")) {
      setData({ ...data, costs: costs.filter((item) => item.id !== id) });
    } else {
      setData({ ...data, benefits: benefits.filter((item) => item.id !== id) });
    }
  };

  // Updating top-level fields
  const handleDecisionContextChange = (value: string) => setData({ ...data, decisionContext: value });
  const handleDiscountRateChange = (value: number) => setData({ ...data, discountRate: value });
  const setActiveTabLocal = (tab: "costs" | "benefits") => setData({ ...data, activeTab: tab });

  // Analysis calculations
  const calculateTotalCosts = () => costs.reduce((sum, item) => sum + item.value, 0);
  const calculateTotalBenefits = () => benefits.reduce((sum, item) => sum + item.value, 0);
  const calculateNetBenefit = () => calculateTotalBenefits() - calculateTotalCosts();
  const calculateBCRatio = () => {
    const totalCosts = calculateTotalCosts();
    return totalCosts > 0 ? calculateTotalBenefits() / totalCosts : 0;
  };

  const getTimeframeLabel = (timeframe: "short" | "medium" | "long") => {
    switch (timeframe) {
      case "short":
        return tCostBenefit("costs.shortTerm");
      case "medium":
        return tCostBenefit("costs.mediumTerm");
      case "long":
        return tCostBenefit("costs.longTerm");
    }
  };

  const getRecommendation = () => {
    const netBenefit = calculateNetBenefit();
    const bcRatio = calculateBCRatio();

    if (netBenefit > 0 && bcRatio > 1.5) {
      return tCostBenefit("recommendations.stronglyRecommended");
    } else if (netBenefit > 0 && bcRatio > 1) {
      return tCostBenefit("recommendations.recommended");
    } else if (netBenefit > 0) {
      return tCostBenefit("recommendations.marginallyRecommended");
    } else if (netBenefit < 0) {
      return tCostBenefit("recommendations.notRecommended");
    } else {
      return tCostBenefit("recommendations.neutral");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title={t("tools.costBenefit.title")}
        onReset={resetData}
        backHref="/"
        backText={tCommon("back")}
        resetConfirmationTitle={tCommon("resetConfirmation.title")}
        resetConfirmationDescription={tCommon("resetConfirmation.description")}
        resetConfirmationCancel={tCommon("resetConfirmation.cancel")}
        resetConfirmationConfirm={tCommon("resetConfirmation.confirm")}
        tool={tool}
      />

      {/* -------------- Context -------------- */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{tCostBenefit("context.title")}</CardTitle>
          <CardDescription>{tCostBenefit("context.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Label>{tCostBenefit("analysisContext")}</Label>
          <Textarea
            maxLength={200}
            placeholder={tCostBenefit("analysisContextPlaceholder")}
            value={decisionContext}
            onChange={(e) => handleDecisionContextChange(e.target.value)}
            className="mt-1"
          />

          <div className="flex flex-wrap mt-3 gap-2 items-center">
            <Button
              onClick={() => generateFromContext(data.decisionContext)}
              disabled={generating || !data.decisionContext}
              className="w-full sm:w-auto"
            >
              <SparklesIcon />
              {generating ? tCommon("generating") : t("costBenefit.generateAi")}
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
          </div>        </CardContent>
      </Card>

      {/* -------------- Costs / Benefits -------------- */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Costs */}
        <Card className="border-red-500">
          <CardHeader className="bg-red-50 dark:bg-red-950 rounded-t-xl">
            <CardTitle className="text-red-700 dark:text-red-300">{tCostBenefit("costs.title")}</CardTitle>
            <CardDescription>{tCostBenefit("costs.description")}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {costs.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-1 p-2 border rounded">
                    <div className="flex justify-between">
                      <span>{item.description}</span>
                      <span className="font-medium">
                        {item.isMonetary ? "$" : "~$"}
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {getTimeframeLabel(item.timeframe)} •{" "}
                      {item.isMonetary
                        ? tCostBenefit("costs.monetary")
                        : tCostBenefit("costs.nonMonetary")}
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Show the input form if activeTab === "costs" */}
              {activeTab === "costs" ? (
                <div className="space-y-3 border p-3 rounded-md">
                  <Input
                    placeholder={tCostBenefit("costs.placeholder")}
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>{tCostBenefit("costs.valueLabel")}</Label>
                      <Input
                        type="number"
                        value={newItemValue}
                        onChange={(e) => setNewItemValue(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>{tCostBenefit("costs.timeframeLabel")}</Label>
                      <select
                        value={newItemTimeframe}
                        onChange={(e) => setNewItemTimeframe(e.target.value as "short" | "medium" | "long")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                                  ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none
                                  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                                  disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="short">{tCostBenefit("costs.shortTerm")}</option>
                        <option value="medium">{tCostBenefit("costs.mediumTerm")}</option>
                        <option value="long">{tCostBenefit("costs.longTerm")}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="cost-monetary"
                      checked={newItemIsMonetary}
                      onChange={(e) => setNewItemIsMonetary(e.target.checked)}
                      className="mr-2"
                    />
                    <Label htmlFor="cost-monetary">{tCostBenefit("costs.monetaryCostLabel")}</Label>
                  </div>
                  <Button onClick={addItem} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    {tCostBenefit("costs.addCost")}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setActiveTabLocal("costs")}>
                  <Plus className="mr-2 h-4 w-4" />
                  {tCostBenefit("costs.addCost")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card className="border-green-500">
          <CardHeader className="bg-green-50 dark:bg-green-950 rounded-t-xl">
            <CardTitle className="text-green-700 dark:text-green-300">{tCostBenefit("benefits.title")}</CardTitle>
            <CardDescription>{tCostBenefit("benefits.description")}</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {benefits.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="flex-1 p-2 border rounded">
                    <div className="flex justify-between">
                      <span>{item.description}</span>
                      <span className="font-medium">
                        {item.isMonetary ? "$" : "~$"}
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {getTimeframeLabel(item.timeframe)} •{" "}
                      {item.isMonetary
                        ? tCostBenefit("costs.monetary")
                        : tCostBenefit("costs.nonMonetary")}
                    </div>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Show the input form if activeTab === "benefits" */}
              {activeTab === "benefits" ? (
                <div className="space-y-3 border p-3 rounded-md">
                  <Input
                    placeholder={tCostBenefit("benefits.placeholder")}
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>{tCostBenefit("costs.valueLabel")}</Label>
                      <Input
                        type="number"
                        value={newItemValue}
                        onChange={(e) => setNewItemValue(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>{tCostBenefit("costs.timeframeLabel")}</Label>
                      <select
                        value={newItemTimeframe}
                        onChange={(e) => setNewItemTimeframe(e.target.value as "short" | "medium" | "long")}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm
                                  ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none
                                  focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                                  disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="short">{tCostBenefit("costs.shortTerm")}</option>
                        <option value="medium">{tCostBenefit("costs.mediumTerm")}</option>
                        <option value="long">{tCostBenefit("costs.longTerm")}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="benefit-monetary"
                      checked={newItemIsMonetary}
                      onChange={(e) => setNewItemIsMonetary(e.target.checked)}
                      className="mr-2"
                    />
                    <Label htmlFor="benefit-monetary">{tCostBenefit("benefits.monetaryBenefitLabel")}</Label>
                  </div>
                  <Button onClick={addItem} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    {tCostBenefit("benefits.addBenefit")}
                  </Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setActiveTabLocal("benefits")}>
                  <Plus className="mr-2 h-4 w-4" />
                  {tCostBenefit("benefits.addBenefit")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* -------------- Toggle to see Result -------------- */}
      {!showResult && (costs.length > 0 || benefits.length > 0) && (
        <SeeResultButton
          loading={loading}
          disabled={false}
          onClick={() => handleShowResult(true)}
          label={tCommon("seeResultButton")}
        />
      )}

      {/* -------------- Analysis & Notes -------------- */}
      {showResult && (
        <>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{tCostBenefit("analysis.title")}</CardTitle>
              <CardDescription>{tCostBenefit("analysis.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>{tCostBenefit("analysis.totalCosts")}</span>
                  <span className="font-bold text-red-600">
                    ${calculateTotalCosts().toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{tCostBenefit("analysis.totalBenefits")}</span>
                  <span className="font-bold text-green-600">
                    ${calculateTotalBenefits().toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{tCostBenefit("analysis.netBenefit")}</span>
                  <span
                    className={`font-bold ${calculateNetBenefit() >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                  >
                    ${calculateNetBenefit().toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{tCostBenefit("analysis.ratio")}</span>
                  <span
                    className={`font-bold ${calculateBCRatio() >= 1 ? "text-green-600" : "text-red-600"}`}
                  >
                    {calculateBCRatio().toFixed(2)}
                  </span>
                </div>
                {(costs.length > 0 || benefits.length > 0) && (
                  <div className="rounded-lg border p-4">
                    <h3 className="font-medium">{tCostBenefit("analysis.recommendation")}</h3>
                    <p className="mt-1">{getRecommendation()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{tCostBenefit("notesAndParams.title")}</CardTitle>
              <CardDescription>{tCostBenefit("notesAndParams.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="discount-rate">{tCostBenefit("notesAndParams.discountRate")}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="discount-rate"
                      type="number"
                      min="0"
                      max="100"
                      value={discountRate}
                      onChange={(e) => handleDiscountRateChange(Number(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">
                      {tCostBenefit("notesAndParams.discountRateHelper")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Example share button (similar to Decision Matrix & Pros/Cons) */}
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
        </>
      )}
    </div>
  );
}
