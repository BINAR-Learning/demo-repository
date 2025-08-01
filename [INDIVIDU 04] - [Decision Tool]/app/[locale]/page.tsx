"use client"

import { useTranslations } from "next-intl"
import {
  Dices,
  BarChart2,
  ListChecks,
  Scale,
  LayoutGrid,
  Send,
} from "lucide-react"
import { ToolCard } from "@/components/tool-card"
import { TextareaWithButton } from "@/components/textarea-with-button"
import { useState } from "react"
import { useAiGeneration } from "@/hooks/useAiGeneration"
import Link from "next/link"
import clsx from "clsx"


export default function Home() {
  const t = useTranslations()

  const [textareaValue, setTextareaValue] = useState("");
  const [recommendedTools, setRecommendedTools] = useState<string[]>([]);

  const { generating, generateFromContext } = useAiGeneration('recommendTool', (aiResponse) => {
    if (!aiResponse) return;

    if (aiResponse.recommendedTools) {
      setRecommendedTools(aiResponse.recommendedTools);
    }
  });

  const handleButtonClick = () => {
    setRecommendedTools([]);
    generateFromContext(textareaValue);
  };

  const recommendTool = {
    icon: <Send />,
    onClick: handleButtonClick,
    loading: generating,
  };

  // Helper to get tool display name from path
  const getToolName = (toolPath: string) => {
    switch (toolPath) {
      case "/decision-matrix": return t("tools.decisionMatrix.title");
      case "/pros-cons": return t("tools.prosCons.title");
      case "/random-decision": return t("tools.randomDecision.title");
      case "/weighted-random": return t("tools.weightedRandom.title");
      case "/eisenhower-matrix": return t("tools.eisenhowerMatrix.title");
      case "/swot-analysis": return t("tools.swotAnalysis.title");
      case "/cost-benefit": return t("tools.costBenefit.title");
      case "/scenario-planning": return t("tools.scenarioPlanning.title");
      default: return toolPath;
    }
  };

  return (
    <>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {t("home.title")}
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 dark:text-gray-400 md:text-xl">
                  {t("home.subtitle")}
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 mt-8">
              <TextareaWithButton
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                placeholder={t("common.chatboxPlaceholder")}
                action={recommendTool}
                maxChar={200}
              />
            </div>

            {/* Recommended Tools Section */}
            {recommendedTools.length > 0 && (
              <div className="mx-auto max-w-5xl mt-8 bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl py-6 px-6 animate-fade-in">
                <div className="flex flex-col mb-2">
                  <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    {t("home.recommendedTools", { defaultValue: "Recommended Tools" })}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-400 mt-1">
                    {textareaValue}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 justify-start mt-3">
                  {recommendedTools.map((tool, idx) => (
                    <Link
                      key={tool}
                      href={{ pathname: tool, query: { context: textareaValue } }}
                      className={clsx(
                        "flex items-center justify-between rounded-xl px-3 py-2 bg-white dark:bg-zinc-950 shadow border transition-all group hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer min-w-[160px] max-w-xs w-4/12",
                        idx === 0 && "border-2 border-blue-500"
                      )}
                    >
                      <span className="font-medium text-sm truncate">
                        {getToolName(tool)}
                        {idx === 0 && (
                          <span className="ml-2 text-xs">
                            👍
                          </span>
                        )}
                      </span>
                      <span className="ml-2 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200">
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
                      </span>
                    </Link>

                  ))}
                </div>
              </div>
            )}

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 mt-8 md:grid-cols-3">
              <ToolCard
                title={t("tools.decisionMatrix.title")}
                description={t("tools.decisionMatrix.description")}
                link="/decision-matrix"
                icon={BarChart2}
              />
              {/* 
              <ToolCard
                title={t("tools.decisionTree.title")}
                description={t("tools.decisionTree.description")}
                link="/decision-tree"
                icon={GitBranch}
              /> */}

              <ToolCard
                title={t("tools.prosCons.title")}
                description={t("tools.prosCons.description")}
                link="/pros-cons"
                icon={Scale}
              />

              <ToolCard
                title={t("tools.randomDecision.title")}
                description={t("tools.randomDecision.description")}
                link="/random-decision"
                icon={Dices}
              />

              <ToolCard
                title={t("tools.weightedRandom.title")}
                description={t("tools.weightedRandom.description")}
                link="/weighted-random"
                icon={ListChecks}
              />

              <ToolCard
                title={t("tools.eisenhowerMatrix.title")}
                description={t("tools.eisenhowerMatrix.description")}
                link="/eisenhower-matrix"
                icon={LayoutGrid}
              />

              <ToolCard
                title={t("tools.swotAnalysis.title")}
                description={t("tools.swotAnalysis.description")}
                link="/swot-analysis"
                preview={
                  <div className="flex h-16 w-16 flex-col flex-wrap overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                    <div className="flex-1 flex items-center justify-center bg-green-200 dark:bg-green-900">
                      S
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-red-200 dark:bg-red-900">
                      W
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-blue-200 dark:bg-blue-900">
                      O
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-yellow-200 dark:bg-yellow-900">
                      T
                    </div>
                  </div>
                }
              />

              {/* <ToolCard
                title={t("tools.costBenefit.title")}
                description={t("tools.costBenefit.description")}
                link="/cost-benefit"
                icon={DollarSign}
              /> */}

              {/* <ToolCard
                title={t("tools.scenarioPlanning.title")}
                description={t("tools.scenarioPlanning.description")}
                link="/scenario-planning"
                icon={Map}
              /> */}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
