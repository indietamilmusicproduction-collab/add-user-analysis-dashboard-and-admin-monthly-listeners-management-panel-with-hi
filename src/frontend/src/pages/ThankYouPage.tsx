import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function ThankYouPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Thank You for Your Submission!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-lg text-muted-foreground">
            Your song has been successfully submitted for review. Our team will
            review your submission and get back to you soon.
          </p>
          <p className="text-sm text-muted-foreground">
            You can track the status of your submission in your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button
              onClick={() => navigate({ to: "/user-dashboard" })}
              size="lg"
              className="rounded-full"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
