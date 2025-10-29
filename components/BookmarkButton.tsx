"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";

type SavedOemResponse = {
  oem_org_id: string;
  created_at: string;
  organizations: {
    id: string;
    display_name: string;
    slug: string | null;
  };
};

export default function BookmarkButton({
  oemOrgId,
  oemName,
}: {
  oemOrgId: string;
  oemName: string;
}) {
  const queryClient = useQueryClient();

  // Fetch saved OEMs to check if this one is saved
  const { data: savedOems = [] } = useQuery<SavedOemResponse[]>({
    queryKey: ["saved-oems"],
    queryFn: async () => {
      const response = await fetch("/api/saved-oems");
      if (!response.ok) {
        throw new Error("Failed to load saved OEMs");
      }
      const body = (await response.json()) as { savedOems: SavedOemResponse[] };
      return body.savedOems ?? [];
    },
  });

  const isSaved = savedOems.some((s) => s.oem_org_id === oemOrgId);

  // Save OEM mutation
  const saveOemMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/saved-oems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oemOrgId }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to save OEM");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-oems"] });
      toast.success(`${oemName} saved successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Unsave OEM mutation
  const unsaveOemMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/saved-oems?oemOrgId=${oemOrgId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to remove saved OEM");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-oems"] });
      toast.success(`${oemName} removed from saved`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleToggle = () => {
    if (isSaved) {
      unsaveOemMutation.mutate();
    } else {
      saveOemMutation.mutate();
    }
  };

  return (
    <Button
      variant={isSaved ? "default" : "outline"}
      onClick={handleToggle}
      disabled={saveOemMutation.isPending || unsaveOemMutation.isPending}
    >
      {isSaved ? (
        <>
          <BookmarkCheck className="h-4 w-4 mr-2" />
          Saved
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4 mr-2" />
          Save OEM
        </>
      )}
    </Button>
  );
}
