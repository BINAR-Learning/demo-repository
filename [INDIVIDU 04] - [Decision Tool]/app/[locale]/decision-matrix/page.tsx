"use client";

import React from "react";
import { useEffect, useState } from "react";
import { Divide, Plus, Share2, SparklesIcon, Trash2 } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/page-header"
import { loadSharedData, scrollToBottom } from "@/lib/utils"
import { SeeResultButton } from "@/components/see-result-button"
import ShareUrlButton from "@/components/share-url-button"
import { useDecisionTool } from "@/hooks/useDecisionTool"
import { Tools } from "@/lib/toolsConfig"
import { DecisionMatrixData } from "@/lib/toolsConfigType"
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingOverlay } from "@/components/loading-overlay"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { useIsMobile } from "@/hooks/useBreakpoint"
import MobileEvaluationCard from "./mobile-evaluation-card"
import { Textarea } from "@/components/ui/textarea"

const tool: Tools = "decisionMatrix"

export default function DecisionMatrixPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const format = useFormatter();

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
  }, []);

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
  } = useDecisionTool<DecisionMatrixData>(tool);

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


  const [newOptionName, setNewOptionName] = useState("");
  const [newCriterionName, setNewCriterionName] = useState("");


  useEffect(() => {
    if (data.showResult) {
      scrollToBottom();
    }
  }, [data.showResult]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sharedData = loadSharedData();
      if (sharedData) {
        localStorage.setItem(tool, JSON.stringify(sharedData));
        updateLocalStorage()
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

  const addOption = () => {
    if (!newOptionName.trim()) return;
    const newId = `opt-${Date.now()}`
    setData({
      ...data,
      options: [...data.options, { id: newId, name: newOptionName, scores: {} }],
      showResult: false,
    });
    setNewOptionName("");
  };

  const removeOption = (id: string) => {
    setData({
      ...data,
      options: data.options.filter((o) => o.id !== id),
      showResult: false,
    });
  };

  const addCriterion = () => {
    if (!newCriterionName.trim()) return;
    const newId = `cri-${Date.now()}`
    setData({
      ...data,
      criteria: [...data.criteria, { id: newId, name: newCriterionName, weight: 0 }],
      showResult: false,
    });
    setNewCriterionName("");
  };

  const removeCriterion = (id: string) => {
    setData({
      ...data,
      criteria: data.criteria.filter((c) => c.id !== id),
      showResult: false,
    });
  };

  const updateScore = (optionId: string, criterionId: string, score: number) => {
    setData({
      ...data,
      options: data.options.map((o) =>
        o.id === optionId ? { ...o, scores: { ...o.scores, [criterionId]: score } } : o
      ),
      showResult: false,
    });
  };

  const updateCriterionWeight = (criterionId: string, weight: number) => {
    setData({
      ...data,
      criteria: data.criteria.map((c) => (c.id === criterionId ? { ...c, weight } : c)),
      showResult: false,
    });
  };

  const calculateTotalScore = (option: any) => {
    return data.criteria.reduce((total, c) => {
      const score = option.scores[c.id] || 0;
      return total + score * c.weight;
    }, 0);
  };

  const getBestOption = () => {
    if (!data.options.length) return null;
    return data.options.reduce((best, current) =>
      calculateTotalScore(current) > calculateTotalScore(best) ? current : best
    );
  };

  const bestOption = getBestOption();

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="container mx-auto py-8">
        <PageHeader
          title={t("tools.decisionMatrix.title")}
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
            <CardTitle>{t("decisionMatrix.context.title")}</CardTitle>
            <CardDescription>{t("decisionMatrix.context.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              maxLength={200}
              placeholder={t("decisionMatrix.context.placeholder")}
              value={data.decisionContext}
              onChange={(e) => {
                setData({ ...data, decisionContext: e.target.value, showResult: false });
              }}
            />
            <div className="flex flex-wrap mt-3 gap-2 items-center">
              <Button
                onClick={() => generateFromContext(data.decisionContext)}
                className="w-full sm:w-auto"
                disabled={generating || !data.decisionContext}
              >
                <SparklesIcon />
                {generating ? tCommon("generating") : t("decisionMatrix.generateAi")}
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

        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("decisionMatrix.options.title")}</CardTitle>
              <CardDescription>{t("decisionMatrix.options.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-2">
                    <Input
                      value={option.name}
                      onChange={(e) => {
                        setData({
                          ...data,
                          options: data.options.map((o) =>
                            o.id === option.id ? { ...o, name: e.target.value } : o
                          ),
                          showResult: false,
                        });
                      }}
                    />
                    <Button variant="outline" size="icon" onClick={() => removeOption(option.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder={t("decisionMatrix.options.placeholder")}
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addOption()}
                  />
                  <Button onClick={addOption}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("common.add")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("decisionMatrix.criteria.title")}</CardTitle>
              <CardDescription>{t("decisionMatrix.criteria.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={criterion.name}
                        onChange={(e) => {
                          setData({
                            ...data,
                            criteria: data.criteria.map((c) =>
                              c.id === criterion.id ? { ...c, name: e.target.value } : c
                            ),
                            showResult: false,
                          });
                        }}
                      />
                      <Button variant="outline" size="icon" onClick={() => removeCriterion(criterion.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {criterion.description && (
                      <p className="text-xs text-muted-foreground">{criterion.description}</p>
                    )}
                    <div className="flex items-center gap-4">
                      <Label>
                        {t("decisionMatrix.criteria.weight")}: {criterion.weight}
                      </Label>
                      <Slider
                        value={[criterion.weight]}
                        min={0}
                        max={10}
                        step={1}
                        className="flex-1"
                        onValueChange={(value) => updateCriterionWeight(criterion.id, value[0])}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder={t("decisionMatrix.criteria.placeholder")}
                    value={newCriterionName}
                    onChange={(e) => setNewCriterionName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCriterion()}
                  />
                  <Button onClick={addCriterion}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("common.add")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {data.options.length > 0 && data.criteria.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>{t("decisionMatrix.evaluation.title")}</CardTitle>
              <CardDescription>{t("decisionMatrix.evaluation.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isMobile ? (
                <div>
                  {data.options.map((option) => (
                    <MobileEvaluationCard
                      key={option.id}
                      option={option}
                      criteria={data.criteria}
                      totalScore={calculateTotalScore(option)}
                      updateScore={updateScore}
                    />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">{t("decisionMatrix.options.title")}</TableHead>
                      {data.criteria.map((criterion) => (
                        <TableHead key={criterion.id}>
                          {criterion.name} (×{criterion.weight})
                        </TableHead>
                      ))}
                      <TableHead>{t("decisionMatrix.evaluation.totalScore")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.options.map((option) => (
                      <TableRow key={option.id}>
                        <TableCell className="font-medium">{option.name}</TableCell>
                        {data.criteria.map((criterion) => (
                          <TableCell key={criterion.id}>
                            <Slider
                              value={[option.scores[criterion.id] ?? 0]}
                              min={0}
                              max={10}
                              step={1}
                              onValueChange={(value) => updateScore(option.id, criterion.id, value[0])}
                            />
                            <div className="mt-1 text-center">{option.scores[criterion.id] ?? 0}</div>
                          </TableCell>
                        ))}
                        <TableCell className="font-bold">
                          {format.number(calculateTotalScore(option), {
                            maximumFractionDigits: 1,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {!data.showResult && (
          <SeeResultButton
            loading={loading}
            disabled={data.options.length < 1 && data.criteria.length < 1}
            onClick={() => handleShowResult(true)}
            label={t("common.seeResultButton")}
          />
        )}

        {data.showResult && bestOption && (
          <>
            <Card className="mt-8 mb-4 border-green-500">
              <CardHeader className="rounded-t-xl bg-green-50 dark:bg-green-950">
                <CardTitle className="text-green-700 dark:text-green-300">
                  {t("decisionMatrix.recommendation.title")}
                </CardTitle>
                <CardDescription>{t("decisionMatrix.recommendation.description")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-xl font-bold">{bestOption.name}</p>
                <p className="text-muted-foreground">
                  {t("decisionMatrix.evaluation.totalScore")}:{" "}
                  {format.number(calculateTotalScore(bestOption), { maximumFractionDigits: 1 })}
                </p>
              </CardContent>
            </Card>
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
      {(loading || generating) && (
        <LoadingOverlay
          text={generating ? 'Generating...' : 'Loading...'}
        />
      )}
    </>
  );
}