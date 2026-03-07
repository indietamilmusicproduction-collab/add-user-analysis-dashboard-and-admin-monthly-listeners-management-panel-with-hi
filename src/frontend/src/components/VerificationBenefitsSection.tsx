import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, Radio, TrendingUp, Zap } from "lucide-react";
import {
  useApplyForVerification,
  useIsArtistVerified,
} from "../hooks/useQueries";

export default function VerificationBenefitsSection() {
  const { data: isVerified, isLoading: statusLoading } = useIsArtistVerified();
  const applyForVerification = useApplyForVerification();

  // Don't show if user is already verified
  if (isVerified) {
    return null;
  }

  const benefits = [
    {
      icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
      title: "Blue Verified Badge",
      description: "Stand out with a premium blue verification badge",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
      title: "Priority Distribution",
      description: "Get your music distributed faster with priority processing",
    },
    {
      icon: <Zap className="w-5 h-5 text-blue-600" />,
      title: "Faster Approval",
      description: "Skip the queue with expedited submission reviews",
    },
    {
      icon: <Radio className="w-5 h-5 text-blue-600" />,
      title: "Premium Support",
      description: "24/7 dedicated support for all your queries",
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Become a Verified Artist</CardTitle>
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg px-4 py-2">
            ₹200/month
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Unlock premium features and get your music distributed faster with our
          Verified Artist program.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: benefits have no stable id
              key={index}
              className="flex items-start gap-3 p-4 bg-background/80 rounded-lg border"
            >
              <div className="mt-0.5">{benefit.icon}</div>
              <div>
                <h4 className="font-semibold mb-1">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => applyForVerification.mutate()}
          disabled={applyForVerification.isPending || statusLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {applyForVerification.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Apply for Verification
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
