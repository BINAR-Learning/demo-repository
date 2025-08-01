import { Loader2 } from "lucide-react"

interface LoadingOverlayProps {
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  text = "", 
}) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center 
                 bg-black/50 backdrop-blur-sm"
      role="alert"
      aria-busy="true"
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <Loader2 
          className="h-8 w-8 animate-spin text-white" 
          aria-hidden="true"
        />
        <p className="text-sm text-white">
          {text}
        </p>
      </div>
    </div>
  );
};