import { Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span>
              © {currentYear} INDIE TAMIL MUSIC PRODUCTION. All rights reserved.
            </span>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span className="font-medium">Need Help?</span>
              <a
                href="mailto:indietamilmusicproduction@gmail.com"
                className="text-primary hover:underline transition-colors"
              >
                indietamilmusicproduction@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
