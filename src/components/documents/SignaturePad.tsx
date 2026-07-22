"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Progress } from "@/components/ui";
import { uploadDocument, type UploadedDocument } from "./upload";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 300;
const STROKE_WIDTH = 4;

export interface SignaturePadProps {
  docType: string;
  existing: UploadedDocument | null;
  disabled: boolean;
}

/**
 * Draw with a finger, a stylus or a mouse. The canvas keeps a transparent
 * background and black ink, and the server trims the result to the strokes so
 * it drops cleanly into a signature box on a form.
 */
export function SignaturePad({
  docType,
  existing,
  disabled,
}: SignaturePadProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const [hasInk, setHasInk] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.lineWidth = STROKE_WIDTH;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#1D1D1F";
  }, []);

  function pointFrom(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * CANVAS_WIDTH,
      y: ((event.clientY - bounds.top) / bounds.height) * CANVAS_HEIGHT,
    };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    last.current = pointFrom(event);
    setHasInk(true);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !last.current) return;
    event.preventDefault();
    const context = event.currentTarget.getContext("2d");
    if (!context) return;

    const point = pointFrom(event);
    context.beginPath();
    context.moveTo(last.current.x, last.current.y);
    context.lineTo(point.x, point.y);
    context.stroke();
    last.current = point;
  }

  function end() {
    drawing.current = false;
    last.current = null;
  }

  function clear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    setError(null);
  }

  async function send(file: Blob, fileName: string) {
    setProgress(0);
    setError(null);
    try {
      await uploadDocument({
        docType,
        file,
        fileName,
        onProgress: setProgress,
      });
      clear();
      router.refresh();
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "That upload failed.",
      );
    } finally {
      setProgress(null);
    }
  }

  async function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) {
      setError("The signature could not be prepared. Please try again.");
      return;
    }
    await send(blob, "signature.png");
  }

  return (
    <Card>
      {existing && !hasInk && (
        <div className="mb-4 rounded-[10px] bg-white-titanium-lt p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/customer/documents/${existing.id}/file`}
            alt="Your saved signature"
            className="mx-auto h-[80px] object-contain"
          />
          <p className="mt-2 text-center text-footnote text-label-2">
            Saved. Draw below to replace it.
          </p>
        </div>
      )}

      <canvas
        ref={canvasRef}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
        aria-label="Signature area — draw your signature here"
        className="h-[160px] w-full touch-none rounded-[10px] border-[1.5px] border-dashed border-nat-titanium bg-surface"
      />
      {!hasInk && (
        <p className="mt-2 text-center text-footnote text-label-3">
          Sign here with your finger, stylus or mouse
        </p>
      )}

      {progress !== null && (
        <div className="mt-4">
          <Progress value={progress} thin label="Uploading signature" />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-footnote font-medium text-stop">
          {error}
        </p>
      )}

      <div className="mt-3.5 flex gap-[9px]">
        <Button
          variant="quiet"
          size="sm"
          className="flex-1"
          disabled={disabled || !hasInk || progress !== null}
          onClick={clear}
        >
          Clear
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void send(file, file.name);
            event.target.value = "";
          }}
        />
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          disabled={disabled || progress !== null}
          onClick={() => inputRef.current?.click()}
        >
          Upload instead
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          disabled={disabled || !hasInk || progress !== null}
          onClick={() => void save()}
        >
          Save signature
        </Button>
      </div>

      <p className="mt-3.5 text-footnote leading-[1.5] text-label-2">
        Draw it, or upload a scan. Captured once and placed on every form that
        needs it.
      </p>
    </Card>
  );
}
