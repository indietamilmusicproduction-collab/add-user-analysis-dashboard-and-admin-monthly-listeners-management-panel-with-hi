import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  useApplyForVerification,
  useIsArtistVerified,
} from "../hooks/useQueries";

export default function VerificationRenewalSection() {
  const { data: isVerified, isLoading: statusLoading } = useIsArtistVerified();
  const renewVerification = useApplyForVerification();

  // Only show if user is not verified (could be expired)
  if (isVerified || statusLoading) {
    return null;
  }

  const handleRenew = async () => {
    try {
      await renewVerification.mutateAsync();
    } catch {
      // Error already handled by mutation
    }
  };

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-orange-600" />
          <div className="flex-1">
            <CardTitle className="text-xl">
              Verified Artist Status Expired
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Your verified artist benefits have expired. Renew to continue
              enjoying premium features.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-card p-4 rounded-lg space-y-2 border border-border">
          <h4 className="font-semibold text-sm">What you're missing:</h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Blue verified badge and Pro user status</li>
            <li>Priority submission review (appear first in queue)</li>
            <li>Podcast submission access</li>
            <li>24-48 hour distribution priority</li>
            <li>Custom label name option</li>
          </ul>
        </div>

        <Button
          onClick={handleRenew}
          disabled={renewVerification.isPending}
          className="w-full bg-orange-600 hover:bg-orange-700"
          size="lg"
        >
          {renewVerification.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Renew Verified Artist"
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Monthly charge: ₹200 (informational only, no payment required at this
          time)
        </p>
      </CardContent>
    </Card>
  );
}
