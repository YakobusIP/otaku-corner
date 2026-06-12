import { Fragment, type MouseEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { downloadImageVaultAsset } from "@/lib/image-vault-preview";
import { cn } from "@/lib/utils";

import { DownloadIcon } from "lucide-react";
import { toast } from "sonner";

type Props = {
  src: string;
  downloadUrl: string;
  alt?: string;
  className?: string;
};

export default function ImageVaultPreviewImage({
  src,
  downloadUrl,
  alt = "",
  className
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();

    setIsDownloading(true);
    try {
      await downloadImageVaultAsset(downloadUrl);
    } catch {
      toast.error("Could not download image. Try opening the preview instead.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Fragment>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setLightboxOpen(true)}
          className="h-auto w-full overflow-hidden rounded-md border-border/60 bg-muted/20 p-0 text-left"
          aria-label="Open larger preview"
        >
          <img
            src={src}
            alt={alt}
            className={cn(
              "max-h-80 w-full cursor-zoom-in object-contain",
              className
            )}
          />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-2 right-2 h-8 w-8 bg-background/90 shadow-md backdrop-blur-sm hover:bg-background"
          onClick={handleDownload}
          disabled={isDownloading}
          aria-label="Download image"
        >
          <DownloadIcon className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="flex max-h-[95vh] max-w-[95vw] flex-col gap-3 border-border/60 bg-background/95 p-3 sm:max-w-5xl">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          <img
            src={src}
            alt={alt}
            className="max-h-[80vh] w-full object-contain"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <DownloadIcon className="h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
