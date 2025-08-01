import { useState } from "react";
import { RequestBody } from "@/app/api/ai/route";
import { Tools } from "@/lib/toolsConfig";
import { useToast } from "./use-toast";
import { useTranslations } from "next-intl";

export function useAiGeneration(toolName: Tools | 'recommendTool', onAiResult?: (result: any) => void) {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast()
  const t = useTranslations()

  const generateFromContext = async (context: string) => {
    setGenerating(true);
    try {
      const reqBody: RequestBody = {
        decisionContext: context,
        method: toolName,
      };
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "AI Generation Error",
          description: t('common.aiError'),
          duration: 3500
        })
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();
      if (data?.error) {
        toast({
          variant: "destructive",
          title: "AI Generation Error",
          description: t('common.aiError'),
          duration: 3500
        })
        throw new Error(data.error);
      }

      // merge the AI result into local state
      onAiResult?.(data?.result);
    } catch (error) {
      console.error("AI error:", error);
    } finally {
      setGenerating(false);
    }
  };

  return { generating, generateFromContext };
}
