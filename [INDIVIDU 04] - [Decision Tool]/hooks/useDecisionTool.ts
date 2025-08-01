import { getCostBenefitData, getDecisionMatrixData, getDecisionTreeData, getEisenhowerMatrixData, getProsConsData, getRandomDecisionData, getScenarioPlanningData, getSwotAnalysisData, getWeightedRandomData } from '@/lib/sampleData';
import { useAiGeneration } from "@/hooks/useAiGeneration";
import useLocalStorage from "@/hooks/useLocalStorage";
import { decisionToolsConfig, Tools } from "@/lib/toolsConfig";
import { CostBenefitData, DecisionMatrixData, DecisionTreeData, EisenhowerMatrixData, ProsConsData, RandomDecisionData, ScenarioPlanningData, SwotAnalysisData, WeightedRandomData } from "@/lib/toolsConfigType";
import { useState } from "react";
import { useTranslations } from 'next-intl';

export function useDecisionTool<T>(toolKey: Tools) {
  const { toolName, initialData, transformAiResult } = decisionToolsConfig[toolKey];
  const [data, setData, updateFromLocalStorage] = useLocalStorage<T>(toolKey, initialData as T);
  const t = useTranslations()
  const [loading, setLoading] = useState(false);

  const { generating, generateFromContext } = useAiGeneration(toolName, (aiResponse) => {
    if (!aiResponse) return;
    const transformed = transformAiResult(aiResponse);
    mergeAiData(transformed);
  });

  const mergeAiData = (transformed: any) => {
     if (toolKey === "decisionMatrix") {
      const currentData = data as DecisionMatrixData;
      const { generatedOptions = [], generatedCriteria = [] } = transformed;
      setData({
        ...currentData,
        options: [...currentData.options, ...generatedOptions],
        criteria: [...currentData.criteria, ...generatedCriteria],
        showResult: false,
      } as T);
    } else if (toolKey === "prosCons") {
      const currentData = data as ProsConsData;
      const { generatedPros = [], generatedCons = [] } = transformed;
      setData({
        ...currentData,
        pros: [...currentData.pros, ...generatedPros],
        cons: [...currentData.cons, ...generatedCons],
        showResult: false,
      } as T);
    } else if (toolKey === "costBenefit") {
      const currentData = data as CostBenefitData;
      const { generatedCosts = [], generatedBenefits = [] } = transformed;
      setData({
        ...currentData,
        costs: [...currentData.costs, ...generatedCosts],
        benefits: [...currentData.benefits, ...generatedBenefits],
        showResult: false,
      } as T);
    } else if (toolKey === "decisionTree") {
      const currentData = data as DecisionTreeData;
      const { generatedOutcomes = [] } = transformed;
      setData({
        ...currentData,
        rootNode: {
          ...currentData.rootNode,
          children: [...currentData.rootNode.children, ...generatedOutcomes],
        },
        showResult: false,
      } as T);
    } else if (toolKey === "eisenhowerMatrix") {
      const currentData = data as EisenhowerMatrixData;
      const { generatedTasks = [] } = transformed;
      setData({
        ...currentData,
        tasks: [...currentData.tasks, ...generatedTasks],
        showResult: false,
      } as T);
    } else if (toolKey === "randomDecision") {
      const currentData = data as RandomDecisionData;
      const { generatedOptions = [] } = transformed;
      setData({
        ...currentData,
        options: [...currentData.options, ...generatedOptions],
        showResult: false,
      } as T);
    } else if (toolKey === "scenarioPlanning") {
      const currentData = data as ScenarioPlanningData;
      const { generatedScenarios = [], generatedOptions = [] } = transformed;
      setData({
        ...currentData,
        scenarios: [...currentData.scenarios, ...generatedScenarios],
        options: [...currentData.options, ...generatedOptions],
        showResult: false,
      } as T);
    } else if (toolKey === "swotAnalysis") {
      const currentData = data as SwotAnalysisData;
      const { generatedStrengths = [], generatedWeaknesses = [], generatedOpportunities = [], generatedThreats = [] } = transformed;
      setData({
        ...currentData,
        strengths: [...currentData.strengths, ...generatedStrengths],
        weaknesses: [...currentData.weaknesses, ...generatedWeaknesses],
        opportunities: [...currentData.opportunities, ...generatedOpportunities],
        threats: [...currentData.threats, ...generatedThreats],
        showResult: false,
      } as T);
    } else if (toolKey === "weightedRandom") {
      const currentData = data as WeightedRandomData;
      const { generatedOptions = [] } = transformed;
      setData({
        ...currentData,
        options: [...currentData.options, ...generatedOptions],
        showResult: false,
      } as T);
    }
  };

  const handleShowResult = (show: boolean) => {
    if (loading) return;
    setLoading(true);
    setTimeout(() => {
      setData({ ...data, showResult: show });
      setLoading(false);
    }, 300);
  };

  const resetData = () => {
    setData(initialData as T);
  };

  const showSampleData = (transformed: any) => {
    if (toolKey === "decisionMatrix") {
      const data = getDecisionMatrixData(t);
      const { generatedOptions = [], generatedCriteria = [] } = transformed;
      setData({
        ...data,
        options: [...data.options, ...generatedOptions],
        criteria: [...data.criteria, ...generatedCriteria],
        showResult: false,
      } as T);
    } else if (toolKey === "prosCons") {
      const data = getProsConsData(t);
      const { generatedPros = [], generatedCons = [] } = transformed;
      setData({
        ...data,
        pros: [...data.pros, ...generatedPros],
        cons: [...data.cons, ...generatedCons],
        showResult: false,
      } as T);
    } else if (toolKey === "costBenefit") {
      const data = getCostBenefitData(t);
      const { generatedCosts = [], generatedBenefits = [] } = transformed;
      setData({
        ...data,
        costs: [...data.costs, ...generatedCosts],
        benefits: [...data.benefits, ...generatedBenefits],
        showResult: false,
      } as T);
    } else if (toolKey === "decisionTree") {
      const data = getDecisionTreeData(t);
      const { generatedOutcomes = [] } = transformed;
      setData({
        ...data,
        rootNode: {
          ...data.rootNode,
          children: [...data.rootNode.children, ...generatedOutcomes],
        },
        showResult: false,
      } as T);
    } else if (toolKey === "eisenhowerMatrix") {
      const data = getEisenhowerMatrixData(t);
      const { generatedTasks = [] } = transformed;
      setData({
        ...data,
        tasks: [...data.tasks, ...generatedTasks],
        showResult: false,
      } as T);
    } else if (toolKey === "randomDecision") {
      const data = getRandomDecisionData(t);
      const { generatedOptions = [] } = transformed;
      setData({
        ...data,
        options: [...data.options, ...generatedOptions],
        showResult: false,
      } as T);
    } else if (toolKey === "scenarioPlanning") {
      const data = getScenarioPlanningData(t);
      const { generatedScenarios = [], generatedOptions = [] } = transformed;
      setData({
        ...data,
        scenarios: [...data.scenarios, ...generatedScenarios],
        options: [...data.options, ...generatedOptions],
        showResult: false,
      } as T);
    } else if (toolKey === "swotAnalysis") {
      const data = getSwotAnalysisData(t);
      const { generatedStrengths = [], generatedWeaknesses = [], generatedOpportunities = [], generatedThreats = [] } = transformed;
      setData({
        ...data,
        strengths: [...data.strengths, ...generatedStrengths],
        weaknesses: [...data.weaknesses, ...generatedWeaknesses],
        opportunities: [...data.opportunities, ...generatedOpportunities],
        threats: [...data.threats, ...generatedThreats],
        showResult: false,
      } as T);
    } else if (toolKey === "weightedRandom") {
      const data = getWeightedRandomData(t);
      const { generatedOptions = [] } = transformed;
      setData({
        ...data,
        options: [...data.options, ...generatedOptions],
        showResult: false,
      } as T);
    }
  };


  return {
    data,
    setData,
    generating,
    generateFromContext,
    loading,
    handleShowResult,
    resetData,
    updateLocalStorage: updateFromLocalStorage,
    showSampleData
  };
}
