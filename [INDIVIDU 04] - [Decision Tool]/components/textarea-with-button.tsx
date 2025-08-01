import * as React from "react";
import { Card } from "./ui/card";
import { Textarea, type TextareaProps } from "./ui/textarea";
import { Button, type ButtonProps } from "./ui/button";
import { cn } from "@/lib/utils";
import Spinner from "./ui/spinner";

type Action =
  | {
    icon?: React.ReactNode;
    label?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    buttonProps?: ButtonProps;
    loading?: boolean;
  }
  | undefined;

export interface TextareaWithButtonProps extends TextareaProps {
  /** Optional action button displayed to the right */
  action?: Action;
  /** Props forwarded to the wrapping Card */
  cardProps?: React.ComponentProps<typeof Card>;
  /** Container class override (around textarea + button) */
  innerClassName?: string;
  /** Maximum characters allowed in the textarea */
  maxChar?: number;
}

export const TextareaWithButton = React.forwardRef<
  HTMLTextAreaElement,
  TextareaWithButtonProps
>(function TextareaWithButton(
  {
    action,
    cardProps,
    className,
    innerClassName,
    maxChar,
    ...textareaProps
  },
  ref
) {
  return (
    <Card {...cardProps}>
      <div className={cn("flex flex-col items-end gap-2 p-4", innerClassName)}>
        <Textarea
          ref={ref}
          disabled={action?.loading}
          maxLength={maxChar}
          className={cn(
            "flex-1 resize-none border-0 p-0 shadow-none focus-visible:outline-none focus-visible:ring-0",
            className
          )}
          {...textareaProps}
        />
        <div className="flex w-full items-end">
          {maxChar && (
            <div className="text-sm text-gray-500">
              {textareaProps.value?.toString().length}/{maxChar}
            </div>
          )}
          {action && (action.icon || action.label) && (
            <Button
              type="button"
              onClick={action.onClick}
              className="w-fit ml-auto"
              disabled={action.loading || textareaProps.disabled || !textareaProps.value}
              {...action.buttonProps}
            >
              {action.loading ? (
                <Spinner />
              ) : (
                <>
                  {action.label && (
                    <span className={action.icon ? "ml-2" : undefined}>
                      {action.label}
                    </span>
                  )}
                  {action.icon}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
});
