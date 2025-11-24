import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Award, Crown, BarChart3, Settings } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">OEM Dashboard</h1>
                <div className="h-7 w-20 bg-gray-200 animate-pulse rounded-full" />
              </div>
              <div className="h-5 w-64 bg-gray-200 animate-pulse rounded" />
            </div>
            <Button size="lg" variant="outline" disabled>
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>

          {/* Quick Stats - Skeleton */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="h-5 w-5 text-primary" />
                <div className="h-6 w-12 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="text-sm text-muted-foreground">Products</div>
              <Button size="sm" variant="link" className="px-0 mt-1" disabled>
                Manage
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-5 w-5 text-primary" />
                <div className="h-6 w-12 bg-gray-200 animate-pulse rounded" />
              </div>
              <div className="text-sm text-muted-foreground">Certifications</div>
              <Button size="sm" variant="link" className="px-0 mt-1" disabled>
                Manage
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Crown className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground mb-1">Subscription</div>
              <div className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
              <Button size="sm" variant="link" className="px-0 mt-1" disabled>
                Upgrade
              </Button>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground mb-1">Completeness</div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full w-0 bg-primary animate-pulse" />
                </div>
                <div className="h-5 w-10 bg-gray-200 animate-pulse rounded" />
              </div>
            </Card>
          </div>

          {/* Main Content Grid - Skeleton */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Analytics Card */}
            <Card className="p-6">
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 bg-muted/50 rounded-lg">
                    <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-2" />
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Financial Stats Card */}
            <Card className="p-6">
              <div className="h-6 w-40 bg-gray-200 animate-pulse rounded mb-4" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                    <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
