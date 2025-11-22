"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  Plus,
  Trash2,
  Video,
  Image as ImageIcon,
  Play,
} from "lucide-react";
import Image from "next/image";

interface MediaItem {
  id: string;
  title: string;
  media_type: string;
  video_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
}

interface MediaManagerProps {
  oemOrgId: string;
  tier: "FREE" | "INSIGHTS" | "VERIFIED_PARTNER";
}

export default function MediaManager({ oemOrgId, tier }: MediaManagerProps) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState("factory_tour");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const isVerified = tier === "VERIFIED_PARTNER";

  useEffect(() => {
    loadMedia();
  }, [oemOrgId]);

  const loadMedia = async () => {
    try {
      const supabase = createSupabaseBrowserClient() as any;
      const { data, error } = await supabase
        .from("oem_media")
        .select("*")
        .eq("oem_org_id", oemOrgId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error("Error loading media:", error);
      toast.error("Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "video" | "image"
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (type === "video") setVideoFile(e.target.files[0]);
      else setImageFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!title) {
      toast.error("Please enter a title");
      return;
    }

    if (isVerified && !videoFile && !imageFile) {
      toast.error("Please select a video or image");
      return;
    }

    if (!isVerified && !imageFile) {
      toast.error("Please select an image");
      return;
    }

    setUploading(true);
    try {
      const supabase = createSupabaseBrowserClient() as any;
      let videoUrl = null;
      let thumbnailUrl = null;

      // Upload Video (Verified only)
      if (isVerified && videoFile) {
        const fileExt = videoFile.name.split(".").pop();
        const fileName = `${oemOrgId}/${Date.now()}-video.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("oem-media")
          .upload(fileName, videoFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("oem-media").getPublicUrl(fileName);

        videoUrl = publicUrl;
      }

      // Upload Image (Thumbnail or Main Image)
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${oemOrgId}/${Date.now()}-image.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("oem-media")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("oem-media").getPublicUrl(fileName);

        thumbnailUrl = publicUrl;
      }

      // Save to database
      const { error: dbError } = await supabase.from("oem_media").insert({
        oem_org_id: oemOrgId,
        title,
        media_type: mediaType,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
      });

      if (dbError) throw dbError;

      toast.success("Media uploaded successfully");
      setDialogOpen(false);
      resetForm();
      loadMedia();
    } catch (error) {
      console.error("Error uploading media:", error);
      toast.error("Failed to upload media");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const supabase = createSupabaseBrowserClient() as any;
      const { error } = await supabase.from("oem_media").delete().eq("id", id);
      if (error) throw error;

      toast.success("Media deleted");
      loadMedia();
    } catch (error) {
      console.error("Error deleting media:", error);
      toast.error("Failed to delete media");
    }
  };

  const resetForm = () => {
    setTitle("");
    setMediaType("factory_tour");
    setVideoFile(null);
    setImageFile(null);
  };

  if (loading) return <div className="py-8 text-center">Loading media...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Media Gallery</h3>
          <p className="text-sm text-muted-foreground">
            {isVerified
              ? "Upload videos and images to showcase your factory."
              : "Upload images to showcase your factory. Upgrade to Verified Partner to upload videos."}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Add Media
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Media</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Factory Tour, QC Process"
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={mediaType} onValueChange={setMediaType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="factory_tour">Factory Tour</SelectItem>
                    <SelectItem value="qc_process">QC Process</SelectItem>
                    <SelectItem value="product_demo">Product Demo</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isVerified && (
                <div className="space-y-2">
                  <Label>Video File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, "video")}
                    />
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Max 50MB</p>
                </div>
              )}

              <div className="space-y-2">
                <Label>
                  {isVerified ? "Thumbnail Image (Optional)" : "Image File"}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "image")}
                  />
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {media.map((item) => (
          <Card key={item.id} className="overflow-hidden group relative">
            <div className="aspect-video relative bg-slate-100">
              {item.thumbnail_url ? (
                <Image
                  src={item.thumbnail_url}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              {item.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-5 w-5 text-primary ml-1" />
                  </div>
                </div>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-medium truncate">{item.title}</h4>
              <p className="text-xs text-muted-foreground capitalize">
                {item.media_type.replace("_", " ")}
              </p>
            </div>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </Card>
        ))}
        {media.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
            No media uploaded yet
          </div>
        )}
      </div>
    </div>
  );
}
