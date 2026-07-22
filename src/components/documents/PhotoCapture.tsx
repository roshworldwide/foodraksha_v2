"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Progress } from "@/components/ui";
import { uploadDocument, type UploadedDocument } from "./upload";

/** The frame the customer drags inside — 3:4, the passport photo ratio. */
const FRAME_WIDTH = 300;
const FRAME_HEIGHT = 400;
/** What gets uploaded, at twice the frame for print quality. */
const OUTPUT_SCALE = 2;

export interface PhotoCaptureProps {
  docType: string;
  existing: UploadedDocument | null;
  disabled: boolean;
}

/**
 * Passport photograph with a 3:4 crop. Drag to move, slide to zoom; what you
 * see inside the frame is exactly what is stored.
 */
export function PhotoCapture({
  docType,
  existing,
  disabled,
}: PhotoCaptureProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const [source, setSource] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  // Kept in state, not read off the ref, so rendering stays pure.
  const [natural, setNatural] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source);
    };
  }, [source]);

  function chooseFile(file: File) {
    setError(null);
    setNatural(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSource((current) => {
      if (current) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
  }

  /** Smallest scale that still covers the frame. */
  function baseScale(size: { width: number; height: number }): number {
    return Math.max(FRAME_WIDTH / size.width, FRAME_HEIGHT / size.height);
  }

  async function save() {
    const image = imageRef.current;
    if (!image || !natural) return;

    const canvas = document.createElement("canvas");
    canvas.width = FRAME_WIDTH * OUTPUT_SCALE;
    canvas.height = FRAME_HEIGHT * OUTPUT_SCALE;
    const context = canvas.getContext("2d");
    if (!context) return;

    const scale = baseScale(natural) * zoom * OUTPUT_SCALE;
    const drawWidth = natural.width * scale;
    const drawHeight = natural.height * scale;
    const left = canvas.width / 2 - drawWidth / 2 + offset.x * OUTPUT_SCALE;
    const top = canvas.height / 2 - drawHeight / 2 + offset.y * OUTPUT_SCALE;

    context.drawImage(image, left, top, drawWidth, drawHeight);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) {
      setError("The photo could not be prepared. Please try another image.");
      return;
    }

    setProgress(0);
    try {
      await uploadDocument({
        docType,
        file: blob,
        fileName: "passport-photo.png",
        onProgress: setProgress,
      });
      setSource(null);
      router.refresh();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "That upload failed.",
      );
    } finally {
      setProgress(null);
    }
  }

  return (
    <Card>
      {source ? (
        <div>
          <div
            className="relative mx-auto overflow-hidden rounded-[10px] bg-surface-sunk"
            style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
            onPointerDown={(event) => {
              if (disabled) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              dragStart.current = {
                x: event.clientX - offset.x,
                y: event.clientY - offset.y,
              };
            }}
            onPointerMove={(event) => {
              if (!dragStart.current) return;
              setOffset({
                x: event.clientX - dragStart.current.x,
                y: event.clientY - dragStart.current.y,
              });
            }}
            onPointerUp={() => {
              dragStart.current = null;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={source}
              alt="Photograph being positioned"
              onLoad={(event) =>
                setNatural({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight,
                })
              }
              draggable={false}
              className="absolute top-1/2 left-1/2 max-w-none origin-center select-none"
              style={{
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${natural ? baseScale(natural) * zoom : 1})`,
              }}
            />
          </div>

          <label
            htmlFor="photo-zoom"
            className="mt-4 block text-footnote font-semibold text-label-2"
          >
            Zoom
          </label>
          <input
            id="photo-zoom"
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            disabled={disabled}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="mt-1.5 w-full accent-graphite"
          />

          {progress !== null && (
            <div className="mt-4">
              <Progress value={progress} thin label="Uploading photograph" />
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-3 text-footnote font-medium text-stop"
            >
              {error}
            </p>
          )}

          <div className="mt-4 flex gap-[9px]">
            <Button
              variant="quiet"
              size="sm"
              className="flex-1"
              disabled={disabled || progress !== null}
              onClick={() => setSource(null)}
            >
              Choose another
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              disabled={disabled || progress !== null || !natural}
              onClick={() => void save()}
            >
              Use this photo
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div
            className="mx-auto mb-4 flex items-center justify-center overflow-hidden rounded-[10px] bg-surface-sunk text-[26px] text-label-3"
            style={{ width: 84, height: 112 }}
          >
            {existing ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/customer/documents/${existing.id}/file`}
                alt="Your uploaded photograph"
                className="size-full object-cover"
              />
            ) : (
              "◱"
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="mb-3 text-footnote font-medium text-stop"
            >
              {error}
            </p>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) chooseFile(file);
              event.target.value = "";
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            {existing ? "Replace photo" : "Upload photo"}
          </Button>
        </div>
      )}
    </Card>
  );
}
