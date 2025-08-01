import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

interface MobileEvaluationCardProps {
    option: {
        id: string;
        name: string;
        scores: Record<string, number>;
    };
    criteria: Array<{
        id: string;
        name: string;
        weight: number;
    }>;
    totalScore: number;
    updateScore: (optionId: string, criterionId: string, score: number) => void;
}

const MobileEvaluationCard: React.FC<MobileEvaluationCardProps> = ({
    option,
    criteria,
    totalScore,
    updateScore,
}) => {
    const t = useTranslations();

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-lg">{option.name}</CardTitle>
                <div className="text-xs font-medium">
                    {t("decisionMatrix.evaluation.totalScore")}: {totalScore.toFixed(1)}
                </div>
                <Separator />
            </CardHeader>
            <CardContent>
                {criteria.map((criterion, index) => (
                    <div key={criterion.id} className="mb-4">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">
                                {criterion.name} (×{criterion.weight})
                            </span>
                            <span className="text-sm font-bold">
                                {option.scores[criterion.id] ?? 0}
                            </span>
                        </div>
                        <Slider
                            value={[option.scores[criterion.id] ?? 0]}
                            min={0}
                            max={10}
                            step={1}
                            onValueChange={(value) =>
                                updateScore(option.id, criterion.id, value[0])
                            }
                        />
                        {index < criteria.length - 1 && (
                            <Separator className="my-3" />
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

export default MobileEvaluationCard;