import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { ROUTES } from "@/data/MockData";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="container mx-auto max-w-6xl">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-2">OEM Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The OEM you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild>
              <Link href={ROUTES.oems}>Browse OEMs</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
