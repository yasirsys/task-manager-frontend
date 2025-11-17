import { LoaderCircle } from "lucide-react"; // optional, can use any spinner
import React from "react";

interface LoaderProps {
  message?: string;
  size?: number;
}

export const Loader: React.FC<LoaderProps> = ({
  message = "Loading...",
  size = 50,
}) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <LoaderCircle className="animate-spin text-primary" size={size} />
      <p className="mt-4 text-muted-foreground text-lg">{message}</p>
    </div>
  );
};
