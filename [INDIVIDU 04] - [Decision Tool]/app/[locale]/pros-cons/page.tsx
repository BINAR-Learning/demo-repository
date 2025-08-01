"use client";
import React from "react";


import { useEffect, useState } from "react";
import { Plus, Trash2, SparklesIcon, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PageHeader } from "@/components/page-header";
import { SeeResultButton } from "@/components/see-result-button";
import ShareUrlButton from "@/components/share-url-button";
import { loadSharedData, scrollToBottom } from "@/lib/utils";
import { useDecisionTool } from "@/hooks/useDecisionTool";
import { Tools } from "@/lib/toolsConfig";
import { ProsConsData } from "@/lib/toolsConfigType";
import { useRouter, useSearchParams } from 'next/navigation';
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Textarea } from "@/components/ui/textarea";
import { LoadingOverlay } from "@/components/loading-overlay";

const tool: Tools = "prosCons"

export default function ProsCons() {
  const router = useRouter();
  const t = useTranslations();
  const tProsCons = useTranslations("prosCons");
  const tCommon = useTranslations("common");

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
  } = useDecisionTool<ProsConsData>(tool);


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


  const [newProText, setNewProText] = useState("");
  const [newConText, setNewConText] = useState("");

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

  const handleInputChanged = () => {
    if (data.showResult) {
      setData({ ...data, showResult: false });
    }
  };

  const addPro = () => {
    if (!newProText.trim()) return;
    setData({
      ...data,
      pros: [
        ...data.pros,
        { id: `pro${Date.now()}`, text: newProText, weight: 5 },
      ],
      showResult: false,
    });
    setNewProText("");
  };

  const addCon = () => {
    if (!newConText.trim()) return;
    setData({
      ...data,
      cons: [
        ...data.cons,
        { id: `con${Date.now()}`, text: newConText, weight: 5 },
      ],
      showResult: false,
    });
    setNewConText("");
  };

  const updatePro = (id: string, updates: Partial<{ text: string; weight: number }>) => {
    setData({
      ...data,
      pros: data.pros.map((pro) => (pro.id === id ? { ...pro, ...updates } : pro)),
      showResult: false,
    });
  };

  const updateCon = (id: string, updates: Partial<{ text: string; weight: number }>) => {
    setData({
      ...data,
      cons: data.cons.map((con) => (con.id === id ? { ...con, ...updates } : con)),
      showResult: false,
    });
  };

  const removePro = (id: string) => {
    setData({
      ...data,
      pros: data.pros.filter((pro) => pro.id !== id),
      showResult: false,
    });
  };

  const removeCon = (id: string) => {
    setData({
      ...data,
      cons: data.cons.filter((con) => con.id !== id),
      showResult: false,
    });
  };

  const calculateTotalProScore = () => {
    return data.pros.reduce((total, pro) => total + pro.weight, 0);
  };

  const calculateTotalConScore = () => {
    return data.cons.reduce((total, con) => total + con.weight, 0);
  };

  const getRecommendation = () => {
    const proScore = calculateTotalProScore();
    const conScore = calculateTotalConScore();
    if (proScore > conScore) {
      return tProsCons("recommendations.prosOutweigh");
    } else if (conScore > proScore) {
      return tProsCons("recommendations.consOutweigh");
    } else {
      return tProsCons("recommendations.tie");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <>
      <div className="container mx-auto py-8">
        <PageHeader
          title={t("tools.prosCons.title")}
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
            <CardTitle>{tProsCons("decisionContext")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              maxLength={200}
              placeholder={tProsCons("contextPlaceholder")}
              value={data.decisionContext}
              onChange={(e) =>
                setData({ ...data, decisionContext: e.target.value, showResult: false })
              }
            />
            <div className="flex flex-wrap mt-3 gap-2 items-center">
              <Button
                onClick={() => generateFromContext(data.decisionContext)}
                disabled={generating || !data.decisionContext}
                className="w-full sm:w-auto"
              >
                <SparklesIcon />
                {generating ? tCommon("generating") : t("prosCons.generateAi")}
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
          <Card className="border-green-500">
            <CardHeader className="bg-green-50 dark:bg-green-950 rounded-t-xl">
              <CardTitle className="text-green-700 dark:text-green-300">{tProsCons("pros.title")}</CardTitle>
              <CardDescription>{tProsCons("pros.description")}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {data.pros.map((pro) => (
                  <div key={pro.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={pro.text}
                        onChange={(e) => updatePro(pro.id, { text: e.target.value })}
                        placeholder={tProsCons("pros.placeholder")}
                      />
                      <Button variant="outline" size="icon" onClick={() => removePro(pro.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label>
                        {tProsCons("pros.totalScore").split(":")[0]}: {pro.weight}
                      </Label>
                      <Slider
                        value={[pro.weight]}
                        min={1}
                        max={10}
                        step={1}
                        className="flex-1"
                        onValueChange={(value) => updatePro(pro.id, { weight: value[0] })}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder={tProsCons("pros.placeholder")}
                    value={newProText}
                    onChange={(e) => setNewProText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPro()}
                  />
                  <Button onClick={addPro}>
                    <Plus className="mr-2 h-4 w-4" />
                    {tProsCons("pros.addPro")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-500">
            <CardHeader className="bg-red-50 dark:bg-red-950 rounded-t-xl">
              <CardTitle className="text-red-700 dark:text-red-300">{tProsCons("cons.title")}</CardTitle>
              <CardDescription>{tProsCons("cons.description")}</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-4">
                {data.cons.map((con) => (
                  <div key={con.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        value={con.text}
                        onChange={(e) => updateCon(con.id, { text: e.target.value })}
                        placeholder={tProsCons("cons.placeholder")}
                      />
                      <Button variant="outline" size="icon" onClick={() => removeCon(con.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label>
                        {tProsCons("cons.totalScore").split(":")[0]}: {con.weight}
                      </Label>
                      <Slider
                        value={[con.weight]}
                        min={1}
                        max={10}
                        step={1}
                        className="flex-1"
                        onValueChange={(value) => updateCon(con.id, { weight: value[0] })}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder={tProsCons("cons.placeholder")}
                    value={newConText}
                    onChange={(e) => setNewConText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCon()}
                  />
                  <Button onClick={addCon}>
                    <Plus className="mr-2 h-4 w-4" />
                    {tProsCons("cons.addCon")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!data.showResult && (
          <SeeResultButton
            loading={loading}
            disabled={!data.pros.length || !data.cons.length}
            onClick={() => handleShowResult(true)}
            label={t("common.seeResultButton")}
          />
        )}

        {data.showResult && (
          <>
            <Card className="my-8">
              <CardHeader>
                <CardTitle>{tProsCons("analysis.title")}</CardTitle>
                <CardDescription>{tProsCons("analysis.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>{tProsCons("pros.totalScore")}:</span>
                    <span className="font-bold text-green-600">{calculateTotalProScore()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{tProsCons("cons.totalScore")}:</span>
                    <span className="font-bold text-red-600">{calculateTotalConScore()}</span>
                  </div>
                  {(data.pros.length > 0 || data.cons.length > 0) && (
                    <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${(calculateTotalProScore() + calculateTotalConScore()) > 0
                            ? (calculateTotalProScore() /
                              (calculateTotalProScore() + calculateTotalConScore())) * 100
                            : 0
                            }%`,
                        }}
                      ></div>
                    </div>
                  )}
                  {(data.pros.length > 0 || data.cons.length > 0) && (
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium">{tProsCons("analysis.recommendation")}</h3>
                      <p className="mt-1">{getRecommendation()}</p>
                    </div>
                  )}
                </div>
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
