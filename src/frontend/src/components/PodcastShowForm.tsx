import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreatePodcastShow,
  useIsCurrentUserBlockedPodcastSubmission,
} from "../hooks/useQueries";
import { Language, PodcastCategory, PodcastType } from "../lib/constants";
import { fileToExternalBlob } from "../utils/fileToExternalBlob";

export default function PodcastShowForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [podcastType, setPodcastType] = useState<"audio" | "video">("audio");
  const [category, setCategory] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createShow = useCreatePodcastShow();
  const { data: isBlocked, isLoading: blockCheckLoading } =
    useIsCurrentUserBlockedPodcastSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      toast.error("Your access blocked due to submission limit is full");
      return;
    }

    if (!title || !description || !category || !language || !artworkFile) {
      return;
    }

    try {
      const artworkBlob = await fileToExternalBlob(artworkFile, (progress) => {
        setUploadProgress(progress);
      });

      await createShow.mutateAsync({
        title,
        description,
        podcastType: PodcastType[podcastType],
        category: PodcastCategory[category as keyof typeof PodcastCategory],
        language: Language[language as keyof typeof Language],
        artwork: artworkBlob,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setPodcastType("audio");
      setCategory("");
      setLanguage("");
      setArtworkFile(null);
      setUploadProgress(0);
    } catch (error: any) {
      console.error("Failed to create show:", error);
      if (
        error.message?.includes("blocked") ||
        error.message?.includes("submission limit")
      ) {
        toast.error("Your access blocked due to submission limit is full");
      }
    }
  };

  const isSubmitting = createShow.isPending;

  if (blockCheckLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isBlocked) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Submission Access Blocked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Your access blocked due to submission limit is full
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Podcast Show</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Show Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter show title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter show description"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="podcastType">Podcast Type *</Label>
            <Select
              value={podcastType}
              onValueChange={(value: "audio" | "video") =>
                setPodcastType(value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select podcast type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arts">Arts</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="healthFitness">Health & Fitness</SelectItem>
                <SelectItem value="kidsFamily">Kids & Family</SelectItem>
                <SelectItem value="music">Music</SelectItem>
                <SelectItem value="newsPolitics">News & Politics</SelectItem>
                <SelectItem value="religionSpirituality">
                  Religion & Spirituality
                </SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="tvFilm">TV & Film</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="language">Language *</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="tamil">Tamil</SelectItem>
                <SelectItem value="telugu">Telugu</SelectItem>
                <SelectItem value="kannada">Kannada</SelectItem>
                <SelectItem value="malayalam">Malayalam</SelectItem>
                <SelectItem value="punjabi">Punjabi</SelectItem>
                <SelectItem value="bengali">Bengali</SelectItem>
                <SelectItem value="marathi">Marathi</SelectItem>
                <SelectItem value="gujarati">Gujarati</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="artwork">Show Artwork *</Label>
            <Input
              id="artwork"
              type="file"
              accept="image/*"
              onChange={(e) => setArtworkFile(e.target.files?.[0] || null)}
              required
            />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {uploadProgress}% uploaded
                </p>
              </div>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Show...
              </>
            ) : (
              "Create Show"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
