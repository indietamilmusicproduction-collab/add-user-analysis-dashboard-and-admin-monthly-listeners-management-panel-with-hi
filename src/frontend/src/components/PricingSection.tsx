// @ts-nocheck
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useGetAllSubscriptionPlans } from "../hooks/useQueries";

export default function PricingSection() {
  const { data: plans, isLoading } = useGetAllSubscriptionPlans();

  const handleSelectPlan = (redirectUrl: string) => {
    window.open(redirectUrl, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!plans || plans.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-blue-950/20">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Subscription Plans
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your music journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.planName}
              className="flex flex-col hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/50"
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plan.planName}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
                    ₹{plan.pricePerYear.toString()}
                  </span>
                  <span className="text-muted-foreground"> / year</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 mb-6 flex-1">
                  {plan.benefits.map((benefit, index) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: benefits are plain strings
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSelectPlan(plan.redirectUrl)}
                  className="w-full"
                  size="lg"
                >
                  Select Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
