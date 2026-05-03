"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Icons } from "@/components/ui/Icons";
import { useState } from "react";

interface LikeButtonProps {
  publicationId?: number;
  projetId?: number;
  initialLiked?: boolean;
  initialCount?: number;
}

export function LikeButton({ publicationId, projetId, initialLiked = false, initialCount = 0 }: LikeButtonProps) {
  const queryClient = useQueryClient();
  const [optimisticLiked, setOptimisticLiked] = useState(initialLiked);
  const [optimisticCount, setOptimisticCount] = useState(initialCount);
  const [showTooltip, setShowTooltip] = useState(false);

  const toggle = useMutation({
    mutationFn: () => {
      const payload = publicationId
        ? { publication_id: publicationId }
        : { projet_id: projetId };
      return api.post<{ liked: boolean; count: number }>("/likes/toggle", payload);
    },
    onMutate: () => {
      setOptimisticLiked((prev) => !prev);
      setOptimisticCount((prev) => (optimisticLiked ? prev - 1 : prev + 1));
    },
    onError: () => {
      setOptimisticLiked(initialLiked);
      setOptimisticCount(initialCount);
    },
    onSuccess: (data) => {
      setOptimisticLiked(data.liked);
      setOptimisticCount(data.count);
      queryClient.invalidateQueries({ queryKey: ["publication"] });
      queryClient.invalidateQueries({ queryKey: ["project"] });
    },
  });

  const isLiked = toggle.isIdle ? optimisticLiked : toggle.isError ? initialLiked : optimisticLiked;
  const count = toggle.isIdle ? optimisticCount : toggle.isError ? initialCount : optimisticCount;

  return (
    <div className="relative">
      <button
        onClick={() => {
          const token = localStorage.getItem("auth-token");
          if (!token) {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 2000);
            return;
          }
          toggle.mutate();
        }}
        disabled={toggle.isPending}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-mono transition-all ${
          isLiked
            ? "bg-acid/10 text-acid border border-acid/30"
            : "bg-[#111] text-muted border border-[#222] hover:border-acid/30 hover:text-off-white"
        }`}
        aria-label={isLiked ? "Retirer le like" : "Like"}
      >
        <Icons.star
          className={`w-4 h-4 transition-transform ${isLiked ? "scale-110" : ""}`}
          aria-hidden
        />
        <span>{count}</span>
      </button>
      {showTooltip && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-[#222] border border-[#333] rounded text-xs text-muted whitespace-nowrap z-10">
          Connectez-vous pour liker
        </div>
      )}
    </div>
  );
}
