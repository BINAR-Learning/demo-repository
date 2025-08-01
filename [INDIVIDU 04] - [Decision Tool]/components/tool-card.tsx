import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type ToolCardProps = {
  title: string
  description: string
  link: string
  icon?: React.ElementType
  preview?: React.ReactNode
}

export function ToolCard({
  title,
  description,
  link,
  icon: Icon,
  preview,
}: ToolCardProps) {
  return (
    <Card>
      {/* Put icon & text together in the header */}
      <CardHeader>
        {/**
         * NOTE: By default (phone sizes), we use flex-row (horizontal).
         * When screen >= 640px (sm), switch to flex-col (vertical).
         */}
        <div className="flex flex-row items-center gap-4 sm:flex-col sm:items-start">
          {/* Icon / Preview */}
          <div className="flex-shrink-0">
            {preview ? (
              preview
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                {Icon && <Icon className="h-8 w-8 text-gray-400" />}
              </div>
            )}
          </div>

          {/* Title + Description */}
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription className="mt-2">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={link}>
            Start
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
