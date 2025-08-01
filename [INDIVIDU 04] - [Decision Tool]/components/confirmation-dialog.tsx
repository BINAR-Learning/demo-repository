
"use client"

import React from "react";
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Eraser } from "lucide-react"

interface ResetConfirmationDialogProps {

    title: string
    description: string
    cancelText: string
    confirmText: string
    triggerText: string
    onConfirm: any
    className?: string
    triggerVariant?: "link" | "default" | "outline" | "secondary" | "destructive" | "ghost" | null | undefined
    triggerDisabled?: boolean
    confirmVariant?: "link" | "default" | "outline" | "secondary" | "destructive" | "ghost" | null | undefined
}

export function ConfirmationDialog({
    title,
    description,
    cancelText,
    confirmText,
    triggerText,
    onConfirm,
    className,
    triggerVariant = "secondary",
    triggerDisabled = false,
    confirmVariant = "default"
}: ResetConfirmationDialogProps) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant={triggerVariant} disabled={triggerDisabled} size="sm" className={`w-full sm:w-auto ${className || ""}`}>
                    {triggerText}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <AlertDialogCancel className="mt-2 sm:mt-0">{cancelText}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>{confirmText}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

