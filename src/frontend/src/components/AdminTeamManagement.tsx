import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Check, Copy, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGenerateInviteCode, useGetInviteCodes } from "../hooks/useQueries";

export default function AdminTeamManagement() {
  const { data: inviteCodes, isLoading } = useGetInviteCodes();
  const generateCode = useGenerateInviteCode();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleGenerateCode = () => {
    generateCode.mutate();
  };

  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(code);
    toast.success("Invite link copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const unusedCodes = inviteCodes?.filter((code) => !code.used) || [];

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading invite codes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Invite Codes</h3>
          <p className="text-sm text-muted-foreground">
            Generate invite codes for new team members
          </p>
        </div>
        <Button onClick={handleGenerateCode} disabled={generateCode.isPending}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Code
        </Button>
      </div>

      {unusedCodes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No unused invite codes. Generate one to invite team members.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {unusedCodes.map((code) => (
            <Card key={code.code}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Input value={code.code} readOnly className="font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopyLink(code.code)}
                    className="shrink-0"
                  >
                    {copiedCode === code.code ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Created:{" "}
                  {new Date(
                    Number(code.created / BigInt(1000000)),
                  ).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
