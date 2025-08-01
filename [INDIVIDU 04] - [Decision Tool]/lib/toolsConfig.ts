import { CostBenefitData, CostBenefitItem, CostBenefitResult, Criterion, DecisionMatrixData, DecisionMatrixResult, DecisionTreeData, DecisionTreeResult, EisenhowerMatrixData, EisenhowerMatrixResult, EisenhowerTask, Option, OptionPlan, ProsConsData, ProsConsResult, RandomDecisionData, RandomDecisionResult, Scenario, ScenarioPlanningData, ScenarioPlanningResult, SwotAnalysisData, SwotAnalysisResult, SwotItem, TreeNode, WeightedOption, WeightedRandomData, WeightedRandomResult } from "./toolsConfigType";

export type Tools = "decisionMatrix" | "prosCons" | "costBenefit" | "decisionTree" | "eisenhowerMatrix" | "randomDecision" | "scenarioPlanning" | "swotAnalysis" | "weightedRandom" 

export type DecisionToolConfig<
  TInitial,
  TAiResult,
  TGenerated
> = {
  toolName: Tools;
  initialData: TInitial;
  transformAiResult: (result: TAiResult) => TGenerated;
};

export interface DecisionToolsConfig {
  decisionMatrix: DecisionToolConfig<
    DecisionMatrixData,
    DecisionMatrixResult,
    { generatedOptions: Option[]; generatedCriteria: Criterion[] }
  >;

  prosCons: DecisionToolConfig<
    ProsConsData,
    ProsConsResult,
    { generatedPros: { id: string; text: string; weight: number }[]; generatedCons: { id: string; text: string; weight: number }[] }
  >;
  costBenefit: DecisionToolConfig<
    CostBenefitData,
    CostBenefitResult,
    { generatedCosts: CostBenefitItem[]; generatedBenefits: CostBenefitItem[] }
  >;
  decisionTree: DecisionToolConfig<
    DecisionTreeData,
    DecisionTreeResult,
    { generatedOutcomes: { id: string; text: string; probability: number; value: number; children: TreeNode[] }[] }
  >;
  eisenhowerMatrix: DecisionToolConfig<
    EisenhowerMatrixData,
    EisenhowerMatrixResult,
    { generatedTasks: EisenhowerTask[] }
  >;
  randomDecision: DecisionToolConfig<
    RandomDecisionData,
    RandomDecisionResult,
    { generatedOptions: string[] }
  >;
  scenarioPlanning: DecisionToolConfig<
    ScenarioPlanningData,
    ScenarioPlanningResult,
    { generatedScenarios: Scenario[]; generatedOptions: OptionPlan[] }
  >;
  swotAnalysis: DecisionToolConfig<
    SwotAnalysisData,
    SwotAnalysisResult,
    {
      generatedStrengths: SwotItem[];
      generatedWeaknesses: SwotItem[];
      generatedOpportunities: SwotItem[];
      generatedThreats: SwotItem[];
    }
  >;
  weightedRandom: DecisionToolConfig<
    WeightedRandomData,
    WeightedRandomResult,
    { generatedOptions: WeightedOption[] }
  >;
}

export const decisionToolsConfig: DecisionToolsConfig = {
  decisionMatrix: {
    toolName: "decisionMatrix" as Tools,
    initialData: {
      decisionContext: "",
      options: [] as Array<{ id: string; name: string; scores: Record<string, number> }>,
      criteria: [] as Array<{ id: string; name: string; weight: number; description?: string }>,
      showResult: false as boolean,
    },
    transformAiResult: (result: DecisionMatrixResult) => {
      const criteriaIdMap = new Map<number, string>();

      const generatedCriteria = Array.isArray(result.criteria)
        ? result.criteria.map((c, idx) => {
          const newId = `ai-crit-${Date.now()}-${idx}`;
          criteriaIdMap.set(idx, newId);

          return {
            id: newId,
            name: c.name || `Criterion ${idx + 1}`,
            weight: Math.min(Math.max(c.weight || 5, 1), 10),
            description: c.description || '',
          };
        })
        : [];

      const generatedOptions = Array.isArray(result.options)
        ? result.options.map((o, idx) => {
          const scores = generatedCriteria.reduce((acc, crit, critIdx) => {
            // Get score by index or default to 1
            const scoreValue = o.scores
              ? Number(Object.values(o.scores).flat()[critIdx]) || 1
              : 1;
            acc[crit.id] = Math.min(Math.max(scoreValue, 1), 10);
            return acc;
          }, {} as Record<string, number>);

          return {
            id: `ai-opt-${Date.now()}-${idx}`,
            name: o.name || `Option ${idx + 1}`,
            scores,
          };
        })
        : [];
      return { generatedOptions, generatedCriteria };
    },
  },
  prosCons: {
    toolName: "prosCons" as Tools,
    initialData: {
      decisionContext: "",
      pros: [],
      cons: [],
      showResult: false as boolean,
    },
    transformAiResult: (result: ProsConsResult) => {
      const generatedPros =
        Array.isArray(result.pros)
          ? result.pros.map((p, idx) => ({
            id: `ai-pro-${Date.now()}-${idx}`,
            text: p.text ?? `Pro #${idx + 1}`,
            weight: Math.min(Math.max(p.weight || 5, 1), 10)
          }))
          : [];

      const generatedCons =
        Array.isArray(result.cons)
          ? result.cons.map((c, idx) => ({
            id: `ai-con-${Date.now()}-${idx}`,
            text: c.text ?? `Con #${idx + 1}`,
            weight: Math.min(Math.max(c.weight || 5, 1), 10)
          }))
          : [];

      return { generatedPros, generatedCons };
    },
  },
  costBenefit: {
    toolName: "costBenefit" as Tools,
    initialData: {
      title: "",
      decisionContext: "",
      costs: [],
      benefits: [],
      notes: "",
      discountRate: 0,
      activeTab: "costs",
      showResult: false,
    } as CostBenefitData,

    // If you have AI generation for costBenefit, transform it here:
    transformAiResult: (result: CostBenefitResult) => {
      const generatedCosts = Array.isArray(result.costs)
        ? result.costs.map((c, idx) => ({
          id: `ai-cost-${Date.now()}-${idx}`,
          description: c.description ?? `Cost #${idx + 1}`,
          value: c.value ?? 0,
          isMonetary: c.isMonetary ?? true,
          timeframe: c.timeframe ?? "medium",
        }))
        : [];

      const generatedBenefits = Array.isArray(result.benefits)
        ? result.benefits.map((b, idx) => ({
          id: `ai-benefit-${Date.now()}-${idx}`,
          description: b.description ?? `Benefit #${idx + 1}`,
          value: b.value ?? 0,
          isMonetary: b.isMonetary ?? true,
          timeframe: b.timeframe ?? "medium",
        }))
        : [];

      return { generatedCosts, generatedBenefits };
    },
  },
  decisionTree: {
    toolName: "decisionTree" as Tools,
    initialData: {
      decisionContext: "",
      rootNode: {
        id: "root",
        text: "",
        children: [],
      },
      notes: "",
      showResult: false,
    } as DecisionTreeData,

    transformAiResult: (result: DecisionTreeResult) => {
      const generatedOutcomes =
        Array.isArray(result.outcomes)
          ? result.outcomes.map((outcome, i) => ({
            id: `ai-outcome-${Date.now()}-${i}`,
            text: outcome.description || `Outcome #${i + 1}`,
            probability: outcome.probability || 0.5,
            value: outcome.value || 0,
            children: [],
          }))
          : [];
      return { generatedOutcomes };
    },
  },
  eisenhowerMatrix: {
    toolName: "eisenhowerMatrix" as Tools,
    initialData: {
      title: "",
      decisionContext: "",
      tasks: [],
      notes: "",
      showResult: false,
    } as EisenhowerMatrixData,

    transformAiResult: (result: EisenhowerMatrixResult) => {
      const generatedTasks = Array.isArray(result.tasks)
        ? result.tasks.map((t, idx) => ({
          id: `ai-task-${Date.now()}-${idx}`,
          text: t.text ?? `AI-Task #${idx + 1}`,
          urgency: t.urgency ?? 5,
          importance: t.importance ?? 5,
          quadrant: 1 as 1 | 2 | 3 | 4,
        }))
        : [];
      return { generatedTasks };
    },
  },
  randomDecision: {
    toolName: "randomDecision" as Tools,
    initialData: {
      title: "",
      decisionContext: "",
      options: [],
      notes: "",
      rouletteMode: false,
      selectedOption: null,
      isSpinning: false,
      showResult: false,  // optional
    } as RandomDecisionData,

    // If you plan AI generation for random decisions:
    transformAiResult: (result: RandomDecisionResult) => {
      const generatedOptions = Array.isArray(result.options)
        ? result.options.map((o, idx) => o || `AI-Option #${idx + 1}`)
        : [];
      return { generatedOptions };
    },
  },
  scenarioPlanning: {
    toolName: "scenarioPlanning" as Tools,
    initialData: {
      title: "",
      decisionContext: "",
      scenarios: [],
      options: [],
      notes: "",
      showResult: false,
    } as ScenarioPlanningData,

    // If you do AI generation for scenario planning:
    transformAiResult: (result: ScenarioPlanningResult) => {
      // example stub
      const generatedScenarios = Array.isArray(result.scenarios)
        ? result.scenarios.map((sc, idx) => ({
          id: `ai-scenario-${Date.now()}-${idx}`,
          name: sc.name ?? `Scenario #${idx + 1}`,
          description: sc.description ?? "",
          probability: sc.probability ?? 25,
        }))
        : [];

      const generatedOptions = Array.isArray(result.options)
        ? result.options.map((op, idx) => ({
          id: `ai-option-${Date.now()}-${idx}`,
          name: op.name ?? `Option #${idx + 1}`,
          description: op.description ?? "",
          scores: op.scores ?? {},
        }))
        : [];

      return { generatedScenarios, generatedOptions };
    },
  },
  swotAnalysis: {
    toolName: "swotAnalysis" as Tools,
    initialData: {
      title: "",
      decisionContext: "",
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
      notes: "",
      showResult: false,
    } as SwotAnalysisData,

    // If you do AI generation, define how to transform the AI output:
    transformAiResult: (result: SwotAnalysisResult) => {
      const genStrengths = Array.isArray(result.strengths)
        ? result.strengths.map((txt, i) => ({
          id: `ai-s-${Date.now()}-${i}`,
          text: txt,
        }))
        : [];
      const genWeaknesses = Array.isArray(result.weaknesses)
        ? result.weaknesses.map((txt, i) => ({
          id: `ai-w-${Date.now()}-${i}`,
          text: txt,
        }))
        : [];
      const genOpportunities = Array.isArray(result.opportunities)
        ? result.opportunities.map((txt, i) => ({
          id: `ai-o-${Date.now()}-${i}`,
          text: txt,
        }))
        : [];
      const genThreats = Array.isArray(result.threats)
        ? result.threats.map((txt, i) => ({
          id: `ai-t-${Date.now()}-${i}`,
          text: txt,
        }))
        : [];

      return {
        generatedStrengths: genStrengths,
        generatedWeaknesses: genWeaknesses,
        generatedOpportunities: genOpportunities,
        generatedThreats: genThreats,
      };
    },
  },
  weightedRandom: {
    toolName: "weightedRandom" as Tools,
    initialData: {
      title: "",
      decisionContext: "",
      options: [],
      notes: "",
      showProbabilities: false,
      selectedOption: null,
      isSpinning: false,
      showResult: false,
    } as WeightedRandomData,

    transformAiResult: (result: WeightedRandomResult) => {
      const generatedOptions = Array.isArray(result.options)
        ? result.options.map((opt, i) => ({
          id: `ai-opt-${Date.now()}-${i}`,
          text: opt.text ?? `Option #${i + 1}`,
          weight: opt.weight ?? 5,
        }))
        : [];

      return { generatedOptions };
    },
  },

} as const;
