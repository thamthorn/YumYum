import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h1 className="text-5xl font-bold">
                Find Your Perfect{" "}
                <span className="text-primary">Manufacturing Partner</span>
              </h1>
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Browse verified food & beverage OEM manufacturers with AI-powered
              matching
            </p>
          </div>

          {/* Filters Skeleton */}
          <div className="mb-8">
            <Card className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            </Card>
          </div>

          {/* OEM Cards Skeleton */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                {/* Image skeleton */}
                <div className="h-48 bg-gray-200 animate-pulse" />
                
                {/* Content skeleton */}
                <div className="p-6 space-y-4">
                  {/* Title */}
                  <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4" />
                  
                  {/* Location */}
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-12 bg-gray-200 animate-pulse rounded" />
                    <div className="h-12 bg-gray-200 animate-pulse rounded" />
                    <div className="h-12 bg-gray-200 animate-pulse rounded" />
                  </div>
                  
                  {/* Tags */}
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full" />
                    <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full" />
                  </div>
                  
                  {/* Button */}
                  <div className="h-10 bg-gray-200 animate-pulse rounded" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
