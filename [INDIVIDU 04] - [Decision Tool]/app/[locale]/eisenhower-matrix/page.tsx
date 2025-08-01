
"use client";
import React from "react";


import { useEffect, useState } from "react";
import { Plus, Trash2, SparklesIcon, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SeeResultButton } from "@/components/see-result-button";
import ShareUrlButton from "@/components/share-url-button";

import { cn, loadSharedData } from "@/lib/utils";
import { useDecisionTool } from "@/hooks/useDecisionTool";
import { EisenhowerMatrixData, EisenhowerTask } from "@/lib/toolsConfigType";
import { Tools } from "@/lib/toolsConfig";
import { useRouter, useSearchParams } from 'next/navigation';
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Slider } from "@/components/ui/slider";
import { LoadingOverlay } from "@/components/loading-overlay";

const tool: Tools = "eisenhowerMatrix";

export default function EisenhowerMatrixPage() {
  const router = useRouter();
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const tMatrix = useTranslations("eisenhowerMatrix");

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
  } = useDecisionTool<EisenhowerMatrixData>(tool);

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

  // Destructure the fields from our data object
  const { decisionContext, tasks, showResult } = data;

  // Local state for new task text
  const [newTaskText, setNewTaskText] = useState("");

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

  // ---------------------------------------
  // 1) Task Logic & Quadrant Calculation
  // ---------------------------------------
  const addTask = () => {
    if (!newTaskText.trim()) return;
    const newTask: EisenhowerTask = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      urgency: 5,
      importance: 5,
      quadrant: determineQuadrant(5, 5),
    };
    setData({ ...data, tasks: [...tasks, newTask], showResult: false });
    setNewTaskText("");
  };

  const removeTask = (id: string) => {
    setData({ ...data, tasks: tasks.filter((task) => task.id !== id), showResult: false });
  };

  const updateTaskUrgency = (id: string, urgency: number) => {
    setData({
      ...data,
      tasks: tasks.map((task) =>
        task.id === id
          ? { ...task, urgency, quadrant: determineQuadrant(urgency, task.importance) }
          : task
      ),
      showResult: false,
    });
  };

  const updateTaskImportance = (id: string, importance: number) => {
    setData({
      ...data,
      tasks: tasks.map((task) =>
        task.id === id
          ? { ...task, importance, quadrant: determineQuadrant(task.urgency, importance) }
          : task
      ),
      showResult: false,
    });
  };

  const [urgencyThreshold, setUrgencyThreshold] = useState(5);
  const [importanceThreshold, setImportanceThreshold] = useState(5);

  useEffect(() => {
    if (tasks.length === 0) {
      // Fallback if no tasks
      setUrgencyThreshold(5);
      setImportanceThreshold(5);
      return;
    }

    // 1) Compute the average urgency
    const totalUrgency = tasks.reduce((acc, task) => acc + task.urgency, 0);
    const avgUrgency = totalUrgency / tasks.length;

    // 2) Compute the average importance
    const totalImportance = tasks.reduce((acc, task) => acc + task.importance, 0);
    const avgImportance = totalImportance / tasks.length;

    // 3) Update thresholds
    setUrgencyThreshold(avgUrgency);
    setImportanceThreshold(avgImportance);
  }, [tasks]);


  const determineQuadrant = (urgency: number, importance: number): 1 | 2 | 3 | 4 => {
    if (urgency >= urgencyThreshold && importance >= importanceThreshold) {
      return 1; // Urgent & Important
    }
    if (urgency < urgencyThreshold && importance >= importanceThreshold) {
      return 2; // Not Urgent & Important
    }
    if (urgency >= urgencyThreshold && importance < importanceThreshold) {
      return 3; // Urgent & Not Important
    }
    return 4;   // Not Urgent & Not Important
  };


  const getQuadrantTasks = (quadrant: 1 | 2 | 3 | 4) =>
    tasks.filter(
      (task) => determineQuadrant(task.urgency, task.importance) === quadrant
    );

  const getQuadrantInfo = (q: 1 | 2 | 3 | 4) => {
    switch (q) {
      case 1:
        return {
          title: tMatrix("quadrants.q1.title"),
          description: tMatrix("quadrants.q1.description"),
          action: tMatrix("quadrants.q1.action"),
          color: "bg-red-100 dark:bg-red-950",
          borderColor: "border-red-500",
          textColor: "text-red-700 dark:text-red-300",
        };
      case 2:
        return {
          title: tMatrix("quadrants.q2.title"),
          description: tMatrix("quadrants.q2.description"),
          action: tMatrix("quadrants.q2.action"),
          color: "bg-green-100 dark:bg-green-950",
          borderColor: "border-green-500",
          textColor: "text-green-700 dark:text-green-300",
        };
      case 3:
        return {
          title: tMatrix("quadrants.q3.title"),
          description: tMatrix("quadrants.q3.description"),
          action: tMatrix("quadrants.q3.action"),
          color: "bg-yellow-100 dark:bg-yellow-950",
          borderColor: "border-yellow-500",
          textColor: "text-yellow-700 dark:text-yellow-300",
        };
      case 4:
        return {
          title: tMatrix("quadrants.q4.title"),
          description: tMatrix("quadrants.q4.description"),
          action: tMatrix("quadrants.q4.action"),
          color: "bg-blue-100 dark:bg-blue-950",
          borderColor: "border-blue-500",
          textColor: "text-blue-700 dark:text-blue-300",
        };
    }
  };

  // ---------------------------------------
  // 2) Event Handlers for Top-Level Fields
  // ---------------------------------------
  const handleContextChange = (val: string) => setData({ ...data, decisionContext: val, showResult: false });

  if (!mounted) {
    return null;
  }
  // ---------------------------------------
  // 3) Render Page
  // ---------------------------------------
  return (
    <>
      <div className="container mx-auto py-8">
        {/* Page Header with reset functionality */}
        <PageHeader
          title={t("tools.eisenhowerMatrix.title")}
          onReset={resetData}
          backHref="/"
          backText={tCommon("back")}
          resetConfirmationTitle={tCommon("resetConfirmation.title")}
          resetConfirmationDescription={tCommon("resetConfirmation.description")}
          resetConfirmationCancel={tCommon("resetConfirmation.cancel")}
          resetConfirmationConfirm={tCommon("resetConfirmation.confirm")}
          tool={tool}
        />

        {/* Title & Context */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{tMatrix("context.title")}</CardTitle>
            <CardDescription>{tMatrix("context.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              maxLength={200}
              id="matrix-context"
              className="mt-1"
              placeholder={tMatrix("context.placeholder")}
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
                {generating ? tCommon("generating") : t("eisenhowerMatrix.generateAi")}
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

        {/* Display tasks & allow adding new tasks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{tMatrix("tasks.title")}</CardTitle>
            <CardDescription>{tMatrix("tasks.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {tasks.map((task) => {
                const info = getQuadrantInfo(task.quadrant);
                return (
                  <div key={task.id} className="space-y-3 rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("flex-1 font-medium ", info?.textColor)}>
                        <span className="block md:inline">{task.text}</span>
                        <span className="text-xs text-muted-foreground md:ml-2">
                          (Quadrant {task.quadrant}: {info?.title})
                        </span>
                      </div>
                      <Button variant="outline" size="icon" onClick={() => removeTask(task.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pb-3">
                      <div>
                        <Label className="flex justify-between">
                          <span>{tMatrix("tasks.urgency")}</span> <span>{task.urgency}/10</span>
                        </Label>
                        <Slider
                          value={[task.urgency]}
                          min={1}
                          max={10}
                          step={1}
                          className="mt-1"
                          onValueChange={(value) => updateTaskUrgency(task.id, Number(value))}
                        />
                      </div>
                      <div>
                        <Label className="flex justify-between">
                          <span>{tMatrix("tasks.importance")}</span> <span>{task.importance}/10</span>
                        </Label>
                        <Slider
                          value={[task.importance]}
                          min={1}
                          max={10}
                          step={1}
                          className="mt-1"
                          onValueChange={(value) => updateTaskImportance(task.id, Number(value))}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* New Task Input */}
              <div className="flex gap-2">
                <Input
                  placeholder={tMatrix("tasks.placeholder")}
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                />
                <Button onClick={addTask}>
                  <Plus className="mr-2 h-4 w-4" />
                  {tMatrix("tasks.add")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toggle to show final Quadrant layout + notes */}
        {!showResult && (
          <SeeResultButton
            loading={loading}
            disabled={tasks.length < 1}
            onClick={() => handleShowResult(true)}
            label={tCommon("seeResultButton")}
          />
        )}

        {showResult && (
          <>
            {/* Quadrant Cards */}
            <div className="grid gap-4 my-8 md:grid-cols-2">
              {[1, 2, 3, 4].map((qNum) => {
                const info = getQuadrantInfo(qNum as 1 | 2 | 3 | 4);
                const quadrantTasks = getQuadrantTasks(qNum as 1 | 2 | 3 | 4);
                return (
                  <Card key={qNum} className={cn("border", info?.borderColor)}>
                    <CardHeader className={cn("rounded-t-xl", info?.color)}>
                      <CardTitle className={info?.textColor}>{info?.title}</CardTitle>
                      <CardDescription>{info?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2 ">
                        <p className={cn("text-sm font-medium", info?.textColor)}>{info?.action}</p>
                        {quadrantTasks.length > 0 ? (
                          <ul className="mt-2 space-y-1">
                            {quadrantTasks.map((task) => (
                              <li key={task.id} className="flex items-center justify-between">
                                <span>{task.text}</span>
                                <span className="text-xs text-muted-foreground">
                                  U:{task.urgency} I:{task.importance}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm italic text-muted-foreground">
                            {tMatrix("quadrants.noTasks")}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Optional share button */}
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
