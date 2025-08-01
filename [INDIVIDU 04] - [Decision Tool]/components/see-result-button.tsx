import React from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface SeeResultButtonProps {
  loading: boolean
  disabled: boolean
  onClick: () => void
  label: string
}

export const SeeResultButton: React.FC<SeeResultButtonProps> = ({
  loading,
  disabled,
  onClick,
  label,
}) => {
  return (
    <Button
      className={`mt-8 h-16 w-full text-md bg-gradient-to-r from-blue-500 via-teal-500 via-green-500 via-teal-500 to-blue-500 text-white shadow-lg hover:brightness-110 ${
        loading || disabled ? "cursor-not-allowed" : "animate-shimmer"
      }`}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {loading ? <Loader2 className="animate-spin" /> : label}
    </Button>
  )
}