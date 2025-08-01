"use client"; 
import React from "react";


import { useState, useEffect } from "react";
import { Plus, Trash2, SparklesIcon, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import ShareUrlButton from "@/components/share-url-button";

import { loadSharedData } from "@/lib/utils";

import { useDecisionTool } from "@/hooks/useDecisionTool";
import { Scenario, Option, ScenarioPlanningData, OptionPlan } from "@/lib/toolsConfigType";
import { Tools } from "@/lib/toolsConfig";
import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from "@/components/confirmation-dialog";

const tool: Tools = "scenarioPlanning";

export default function ScenarioPlanningPage() {
  const router = useRouter();
  const t = useTranslations();
  const tScenario = useTranslations("scenarioPlanning");
  const tCommon = useTranslations("common");

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1) Retrieve scenarioPlanning data & methods from the custom hook
  const {
    data,
    setData,
    generating,          // Only relevant if you do AI
    generateFromContext, // Only relevant if you do AI
    loading,
    handleShowResult,    // If you want to toggle a "show final analysis" button
    resetData,
    updateLocalStorage,
    showSampleData
  } = useDecisionTool<ScenarioPlanningData>(tool);

  // 2) Destructure the scenarioPlanning data
  const { decisionContext, scenarios, options, showResult } = data;

  // 3) Local states for new scenario / new option forms (not persisted)
  const [newScenarioName, setNewScenarioName] = useState("");
  const [newScenarioDesc, setNewScenarioDesc] = useState("");
  const [newScenarioProb, setNewScenarioProb] = useState(25);

  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionDesc, setNewOptionDesc] = useState("");

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

  // ------------------------------------------
  // Helper: set top-level fields in `data`
  // ------------------------------------------
  const setContext = (val: string) => setData({ ...data, decisionContext: val, showResult: false });

  // ------------------------------------------
  // 5) CRUD for Scenarios & Options
  // ------------------------------------------
  const addScenario = () => {
    if (!newScenarioName.trim()) return;
    const newId = `s${scenarios.length + 1}`;

    // Optionally ensure sum(probabilities) <= 100
    const currentTotal = scenarios.reduce((sum, s) => sum + s.probability, 0);
    const remainder = 100 - currentTotal;
    let prob = newScenarioProb;
    if (currentTotal + prob > 100) {
      prob = remainder > 0 ? remainder : 0;
    }

    const newScenario: Scenario = {
      id: newId,
      name: newScenarioName,
      description: newScenarioDesc,
      probability: prob,
    };

    setData({
      ...data,
      scenarios: [...scenarios, newScenario],
      showResult: false,
    });
    setNewScenarioName("");
    setNewScenarioDesc("");
    setNewScenarioProb(25);

    // Also could initialize each option's scores for this new scenario:
    // setData({
    //   ...data,
    //   scenarios: [...scenarios, newScenario],
    //   options: options.map(o => ({
    //     ...o,
    //     scores: { ...o.scores, [newId]: 5 },
    //   })),
    // });
  };

  const removeScenario = (id: string) => {
    setData({
      ...data,
      scenarios: scenarios.filter((s) => s.id !== id),
      options: options.map((o) => {
        const newScores = { ...o.scores };
        delete newScores[id];
        return { ...o, scores: newScores };
      }),
      showResult: false,
    });
  };

  const addOption = () => {
    if (!newOptionName.trim()) return;
    const newId = `o${options.length + 1}`;
    const newOption: OptionPlan = {
      id: newId,
      name: newOptionName,
      description: newOptionDesc,
      scores: {},
    };
    // Initialize new scenario scores to 5 (mid-range)
    scenarios.forEach((s) => {
      newOption.scores[s.id] = 5;
    });

    setData({
      ...data,
      options: [...options, newOption],
      showResult: false,
    });
    setNewOptionName("");
    setNewOptionDesc("");
  };

  const removeOption = (id: string) => {
    setData({
      ...data,
      options: options.filter((o) => o.id !== id),
      showResult: false,
    });
  };

  const updateScenarioProbability = (id: string, probability: number) => {
    setData({
      ...data,
      scenarios: scenarios.map((s) =>
        s.id === id ? { ...s, probability } : s
      ),
      showResult: false,
    });
  };

  const updateScore = (optionId: string, scenarioId: string, score: number) => {
    setData({
      ...data,
      options: options.map((o) =>
        o.id === optionId
          ? {
            ...o,
            scores: { ...o.scores, [scenarioId]: score },
          }
          : o
      ),
      showResult: false,
    });
  };

  // ------------------------------------------
  // 6) Calculations
  // ------------------------------------------
  const calculateExpectedValue = (option: Option) => {
    return scenarios.reduce((sum, s) => {
      const scScore = option.scores[s.id] || 0;
      return sum + (scScore * s.probability) / 100;
    }, 0);
  };

  const getBestOption = () => {
    if (!options.length) return null;
    return options.reduce((best, curr) =>
      calculateExpectedValue(curr) > calculateExpectedValue(best) ? curr : best
    );
  };

  const getMostRobustOption = () => {
    if (!options.length || !scenarios.length) return null;
    const minScores = options.map((opt) => {
      const minScore = Math.min(...scenarios.map((s) => opt.scores[s.id] || 0));
      return { opt, minScore };
    });
    return minScores.reduce((best, curr) =>
      curr.minScore > best.minScore ? curr : best
    ).opt;
  };

  const bestOption = getBestOption();
  const mostRobustOption = getMostRobustOption();

  // Probability sum check
  const totalProbability = scenarios.reduce((sum, s) => sum + s.probability, 0);
  const isProbabilityValid = Math.abs(totalProbability - 100) < 0.01;

  if (!mounted) {
    return null;
  }

  // ------------------------------------------
  // 8) Render the Page
  // ------------------------------------------
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title={t("tools.scenarioPlanning.title")}
        onReset={resetData}
        backHref="/"
        backText={tCommon("back")}
        resetConfirmationTitle={tCommon("resetConfirmation.title")}
        resetConfirmationDescription={tCommon("resetConfirmation.description")}
        resetConfirmationCancel={tCommon("resetConfirmation.cancel")}
        resetConfirmationConfirm={tCommon("resetConfirmation.confirm")}
        tool={tool}
      />

      {/* -------------- Title & Context Fields -------------- */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{tScenario("context.title")}</CardTitle>
          <CardDescription>{tScenario("context.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Label>{tScenario("analysisContext")}</Label>
          <Textarea
            maxLength={200}
            className="mt-1"
            placeholder={tScenario("analysisContextPlaceholder")}
            value={decisionContext}
            onChange={(e) => setContext(e.target.value)}
          />

          <div className="flex flex-wrap mt-3 gap-2 items-center">
            <Button
              onClick={() => generateFromContext(data.decisionContext)}
              disabled={generating || !data.decisionContext}
              className="w-full sm:w-auto"
            >
              <SparklesIcon />
              {generating ? tCommon("generating") : t("scenarioPlanning.generateAi")}
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

      {/* -------------- Scenarios & Options -------------- */}
      {!showResult && (
        <div className="grid gap-8 md:grid-cols-2">
          {/* Future Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle>{tScenario("futureScenarios.title")}</CardTitle>
              <CardDescription>{tScenario("futureScenarios.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!isProbabilityValid && (
                  <div className="rounded-md bg-yellow-100 p-2 text-sm text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    {tScenario("futureScenarios.probabilityWarning", { total: totalProbability })}
                  </div>
                )}

                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{scenario.name}</div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeScenario(scenario.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    <div>
                      <Label className="flex justify-between">
                        <span>{tScenario("futureScenarios.probabilityLabel")}</span>
                        <span>{scenario.probability}%</span>
                      </Label>
                      <Input
                        type="range"
                        min="1"
                        max="100"
                        value={scenario.probability}
                        onChange={(e) => updateScenarioProbability(scenario.id, Number(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}

                {/* Add scenario form */}
                <div className="space-y-3 rounded-md border p-3">
                  <Input
                    placeholder={tScenario("futureScenarios.namePlaceholder")}
                    value={newScenarioName}
                    onChange={(e) => setNewScenarioName(e.target.value)}
                  />
                  <Textarea
                    placeholder={tScenario("futureScenarios.descriptionPlaceholder")}
                    value={newScenarioDesc}
                    onChange={(e) => setNewScenarioDesc(e.target.value)}
                    rows={2}
                  />
                  <div>
                    <Label className="flex justify-between">
                      <span>{tScenario("futureScenarios.probabilityLabel")}</span>
                      <span>{newScenarioProb}%</span>
                    </Label>
                    <Input
                      type="range"
                      min="1"
                      max="100"
                      value={newScenarioProb}
                      onChange={(e) => setNewScenarioProb(Number(e.target.value))}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={addScenario} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    {tScenario("futureScenarios.addScenario")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Options */}
          <Card>
            <CardHeader>
              <CardTitle>{tScenario("strategicOptions.title")}</CardTitle>
              <CardDescription>{tScenario("strategicOptions.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {options.map((option) => (
                  <div key={option.id} className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{option.name}</div>
                      <Button variant="outline" size="icon" onClick={() => removeOption(option.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                    <div className="mt-2 text-sm font-medium">
                      {tScenario("strategicOptions.expectedValue")}{" "}
                      {calculateExpectedValue(option).toFixed(2)}
                    </div>
                  </div>
                ))}

                {/* Add option form */}
                <div className="space-y-3 rounded-md border p-3">
                  <Input
                    placeholder={tScenario("strategicOptions.namePlaceholder")}
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                  />
                  <Textarea
                    placeholder={tScenario("strategicOptions.descriptionPlaceholder")}
                    value={newOptionDesc}
                    onChange={(e) => setNewOptionDesc(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={addOption} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    {tScenario("strategicOptions.addOption")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* -------------- Show the matrix & final analysis only if user toggles or if always visible -------------- */}
      {/* If you want a "See Results" button: */}
      {!showResult && (scenarios.length > 0 || options.length > 0) && (
        <Button
          className="mt-6"
          onClick={() => handleShowResult(true)}
        >
          {tCommon("seeResultButton")}
        </Button>
      )}

      {showResult && (
        <>
          {/* Scenario Analysis Matrix */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{tScenario("scenarioAnalysisMatrix.title")}</CardTitle>
              <CardDescription>{tScenario("scenarioAnalysisMatrix.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">
                      {tScenario("scenarioAnalysisMatrix.options")}
                    </TableHead>
                    {scenarios.map((scenario) => (
                      <TableHead key={scenario.id}>
                        {scenario.name} ({scenario.probability}%)
                      </TableHead>
                    ))}
                    <TableHead>
                      {tScenario("scenarioAnalysisMatrix.expectedValue")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {options.map((option) => (
                    <TableRow key={option.id}>
                      <TableCell className="font-medium">{option.name}</TableCell>
                      {scenarios.map((scenario) => (
                        <TableCell key={scenario.id}>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={option.scores[scenario.id] || 0}
                            onChange={(e) =>
                              updateScore(option.id, scenario.id, Number(e.target.value))
                            }
                            className="w-16 text-center"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="font-bold">
                        {calculateExpectedValue(option).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Analysis & Notes */}
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{tScenario("analysis.title")}</CardTitle>
                <CardDescription>{tScenario("analysis.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bestOption && (
                    <div className="rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950">
                      <h3 className="font-medium text-green-700 dark:text-green-300">
                        {tScenario("analysis.bestValueTitle")}
                      </h3>
                      <p className="mt-1">{bestOption.name}</p>
                      <p className="mt-1 text-sm">
                        {tScenario("strategicOptions.expectedValue")}{" "}
                        {calculateExpectedValue(bestOption).toFixed(2)}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {tScenario("analysis.bestValueDescription")}
                      </p>
                    </div>
                  )}
                  {mostRobustOption && mostRobustOption.id !== bestOption?.id && (
                    <div className="rounded-lg border border-blue-500 bg-blue-50 p-4 dark:bg-blue-950">
                      <h3 className="font-medium text-blue-700 dark:text-blue-300">
                        {tScenario("analysis.mostRobustTitle")}
                      </h3>
                      <p className="mt-1">{mostRobustOption.name}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {tScenario("analysis.mostRobustDescription")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Example share button if you want a shareable URL */}
          <ShareUrlButton
            tool={tool}
            label="Share Scenario URL"
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
