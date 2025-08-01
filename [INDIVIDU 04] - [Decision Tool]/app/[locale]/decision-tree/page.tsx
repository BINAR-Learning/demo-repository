"use client"; 
import React from "react";


import { useEffect, useState } from "react";
import { Plus, Trash2, SparklesIcon, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { SeeResultButton } from "@/components/see-result-button";
import ShareUrlButton from "@/components/share-url-button";

import { loadSharedData } from "@/lib/utils";
import { useDecisionTool } from "@/hooks/useDecisionTool";
import { DecisionTreeData, TreeNode } from "@/lib/toolsConfigType"; import { Tools } from "@/lib/toolsConfig";
import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from "@/components/confirmation-dialog";

const tool: Tools = "decisionTree";

export default function DecisionTreePage() {
  const router = useRouter();
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const tDecisionTree = useTranslations("decisionTree");

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true);
  }, []);

  // Pull in data & actions from our custom hook
  const {
    data,
    setData,
    generating,          // Only relevant if you do AI generation
    generateFromContext, // Only relevant if you do AI generation
    loading,
    handleShowResult,
    resetData,
    updateLocalStorage,
    showSampleData
  } = useDecisionTool<DecisionTreeData>(tool);

  // Destructure fields for convenience
  const { decisionContext, rootNode, showResult } = data;

  // Local state for node selection (not necessarily persisted in localStorage)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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

  // -----------------------
  // 1. Tree Manipulation
  // -----------------------
  const addChild = (parentId: string, newNode: Partial<TreeNode>) => {
    function recurse(node: TreeNode): TreeNode {
      if (node.id === parentId) {
        const child: TreeNode = {
          id: `node-${Date.now()}`,
          text: newNode.text || tDecisionTree("initial.newNodeText"),
          probability: newNode.probability ?? 1,
          value: newNode.value ?? 0,
          children: [],
        };
        return { ...node, children: [...node.children, child] };
      }
      return { ...node, children: node.children.map(recurse) };
    }
    setData({ ...data, rootNode: recurse(rootNode), showResult: false });
  };

  const updateNode = (nodeId: string, updates: Partial<TreeNode>) => {
    function recurse(node: TreeNode): TreeNode {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      return { ...node, children: node.children.map(recurse) };
    }
    setData({ ...data, rootNode: recurse(rootNode), showResult: false });
  };

  const removeNode = (nodeId: string) => {
    function recurse(node: TreeNode): TreeNode {
      return {
        ...node,
        children: node.children
          .filter((child) => child.id !== nodeId)
          .map(recurse),
      };
    }
    setData({ ...data, rootNode: recurse(rootNode), showResult: false });
  };

  // -----------------------
  // 2. Calculations
  // -----------------------
  const calculateExpectedValue = (node: TreeNode): number => {
    if (node.children.length === 0) {
      return node.value || 0;
    }
    return node.children.reduce((sum, child) => {
      return sum + calculateExpectedValue(child) * (child.probability ?? 1);
    }, 0);
  };

  // Among all children of rootNode, pick the best
  const findBestOption = () => {
    if (!rootNode.children.length) return null;
    let best = rootNode.children[0];
    let bestValue = calculateExpectedValue(best);
    for (let i = 1; i < rootNode.children.length; i++) {
      const candidate = rootNode.children[i];
      const candidateVal = calculateExpectedValue(candidate);
      if (candidateVal > bestValue) {
        best = candidate;
        bestValue = candidateVal;
      }
    }
    return { option: best, value: bestValue };
  };

  const bestOption = findBestOption();

  // 3. Node Rendering (recursive)
  const renderNode = (node: TreeNode, level = 0) => {
    const expectedValue = calculateExpectedValue(node);
    const isSelected = node.id === selectedNodeId;

    return (
      <div key={node.id} className="mb-4" style={{ marginLeft: `${level * 24}px` }}>
        <Card className={isSelected ? "border-primary" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Input
                  value={node.text}
                  onChange={(e) => updateNode(node.id, { text: e.target.value })}
                  className="mb-2"
                  onClick={() => setSelectedNodeId(node.id)}
                />
                {/* Probability slider if not the root */}
                {level > 0 && (
                  <div className="mb-2">
                    <Label>
                      {tDecisionTree("node.probabilityLabel")}: {node.probability?.toFixed(1)}
                    </Label>
                    <Slider
                      value={[node.probability ?? 1]}
                      min={0}
                      max={1}
                      step={0.1}
                      onValueChange={(val) => updateNode(node.id, { probability: val[0] })}
                    />
                  </div>
                )}
                {/* Leaf node value */}
                {node.children.length === 0 && (
                  <div className="mb-2">
                    <Label>{tDecisionTree("node.valueLabel")}</Label>
                    <Input
                      type="number"
                      value={node.value ?? 0}
                      onChange={(e) => updateNode(node.id, { value: Number(e.target.value) })}
                    />
                  </div>
                )}
                {/* Show expected value for each node */}
                <div className="mt-2 text-sm font-medium">
                  {tDecisionTree("analysis.expectedValue")} {expectedValue.toFixed(2)}
                </div>
              </div>
              {/* Remove node button (not on root) */}
              {level > 0 && (
                <Button variant="outline" size="icon" className="ml-2" onClick={() => removeNode(node.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              {/* Add child option */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  addChild(node.id, { text: tDecisionTree("initial.newNodeText") });
                  setSelectedNodeId(node.id);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {tDecisionTree("tree.addOption")}
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Render children */}
        <div className="mt-2">{node.children.map((child) => renderNode(child, level + 1))}</div>
      </div>
    );
  };

  // 4. Additional interactions
  const handleDecisionContextChange = (val: string) => setData({ ...data, decisionContext: val, showResult: false });

  if (!mounted) {
    return null;
  }

  // 5. Render Page
  return (
    <div className="container mx-auto py-8">
      <PageHeader
        title={t("tools.decisionTree.title")}
        onReset={resetData}
        backHref="/"
        backText={tCommon("back")}
        resetConfirmationTitle={tCommon("resetConfirmation.title")}
        resetConfirmationDescription={tCommon("resetConfirmation.description")}
        resetConfirmationCancel={tCommon("resetConfirmation.cancel")}
        resetConfirmationConfirm={tCommon("resetConfirmation.confirm")}
        tool={tool}
      />

      {/* Context Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{tDecisionTree("context.title")}</CardTitle>
          <CardDescription>{tDecisionTree("context.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            maxLength={200}
            placeholder={tDecisionTree("context.placeholder")}
            value={decisionContext}
            onChange={(e) => handleDecisionContextChange(e.target.value)}
          />
          <div className="flex flex-wrap mt-3 gap-2 items-center">
            <Button
              onClick={() => generateFromContext(data.decisionContext)}
              disabled={generating || !data.decisionContext}
              className="w-full sm:w-auto"
            >
              <SparklesIcon />
              {generating ? tCommon("generating") : t("decisionTree.generateAi")}
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

      {/* Tree + Analysis */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{tDecisionTree("tree.title")}</CardTitle>
              <CardDescription>{tDecisionTree("tree.description")}</CardDescription>
            </CardHeader>
            <CardContent>{renderNode(rootNode)}</CardContent>
          </Card>
        </div>

        <div>
          {/* Show the "See Results" button if there's at least one child under root */}
          {!showResult && rootNode.children.length > 0 && (
            <SeeResultButton
              loading={loading}
              disabled={false}
              onClick={() => handleShowResult(true)}
              label={tCommon("seeResultButton")}
            />
          )}

          {/* Analysis card (only show if user has clicked "See Result") */}
          {showResult && (
            <>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>{tDecisionTree("analysis.title")}</CardTitle>
                  <CardDescription>{tDecisionTree("analysis.description")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rootNode.children.length > 0 && (
                      <div>
                        <h3 className="font-medium">{tDecisionTree("analysis.expectedValue")}</h3>
                        <ul className="mt-2 space-y-1">
                          {rootNode.children.map((option) => (
                            <li key={option.id}>
                              {option.text}: {calculateExpectedValue(option).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Best option highlight */}
                    {bestOption && (
                      <div className="rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950">
                        <h3 className="font-medium text-green-700 dark:text-green-300">
                          {tDecisionTree("analysis.recommendedDecision")}
                        </h3>
                        <p className="mt-1">{bestOption.option.text}</p>
                        <p className="mt-1 text-sm">
                          {tDecisionTree("analysis.expectedValue")} {bestOption.value.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Optional share button (like the other tools) */}
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
      </div>
    </div>
  );
}
