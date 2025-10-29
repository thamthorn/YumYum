"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CreateReviewDialogProps = {
  oemOrgId: string;
  oemName: string;
  children?: React.ReactNode;
};

type CreateReviewPayload = {
  oemOrgId: string;
  rating: number;
  qualityRating: number;
  communicationRating: number;
  deliveryRating: number;
  serviceRating: number;
  title: string;
  reviewText: string;
};

export default function CreateReviewDialog({
  oemOrgId,
  oemName,
  children,
}: CreateReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [serviceRating, setServiceRating] = useState(5);
  const [title, setTitle] = useState("");
  const [reviewText, setReviewText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createReviewMutation = useMutation({
    mutationFn: async (data: CreateReviewPayload) => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create review");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["oem-reviews", oemOrgId] });
      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });
      setOpen(false);
      // Reset form
      setRating(5);
      setQualityRating(5);
      setCommunicationRating(5);
      setDeliveryRating(5);
      setServiceRating(5);
      setTitle("");
      setReviewText("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReviewMutation.mutate({
      oemOrgId,
      rating,
      qualityRating,
      communicationRating,
      deliveryRating,
      serviceRating,
      title,
      reviewText,
    });
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
            aria-label={`Rate ${star} out of 5`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= value
                  ? "fill-primary text-primary"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">{value}/5</span>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Write a Review</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Write a Review for {oemName}</DialogTitle>
          <DialogDescription>
            Share your experience with this OEM to help other buyers.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <StarRating
            label="Overall Rating"
            value={rating}
            onChange={setRating}
          />

          {/* Category Ratings */}
          <div className="grid md:grid-cols-2 gap-4">
            <StarRating
              label="Quality"
              value={qualityRating}
              onChange={setQualityRating}
            />
            <StarRating
              label="Communication"
              value={communicationRating}
              onChange={setCommunicationRating}
            />
            <StarRating
              label="Delivery"
              value={deliveryRating}
              onChange={setDeliveryRating}
            />
            <StarRating
              label="Service"
              value={serviceRating}
              onChange={setServiceRating}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title (Optional)</Label>
            <Input
              id="title"
              placeholder="Sum up your experience..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">Your Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Tell us more about your experience..."
              rows={5}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createReviewMutation.isPending}>
              {createReviewMutation.isPending
                ? "Submitting..."
                : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
