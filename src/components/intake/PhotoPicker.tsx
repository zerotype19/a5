"use client";

import { useId, useRef } from "react";
import {
  isAllowedPhotoMime,
  isExplicitlyBlockedFilename,
  MAX_PHOTO_BYTES,
  MAX_PROJECT_PHOTOS,
} from "@/lib/photos/constants";
import styles from "./intake.module.css";

export type SelectedPhoto = {
  id: string;
  file: File;
  previewUrl: string;
};

type Props = {
  photos: SelectedPhoto[];
  error?: string;
  disabled?: boolean;
  onChange: (photos: SelectedPhoto[]) => void;
  onClientError?: (message: string | null) => void;
};

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PhotoPicker({
  photos,
  error,
  disabled,
  onChange,
  onClientError,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = `${inputId}-error`;

  function handleFiles(fileList: FileList | null) {
    if (!fileList || disabled) return;
    const incoming = Array.from(fileList);
    const next = [...photos];
    let localError: string | null = null;

    for (const file of incoming) {
      if (next.length >= MAX_PROJECT_PHOTOS) {
        localError = `You can attach up to ${MAX_PROJECT_PHOTOS} photos.`;
        break;
      }
      if (
        isExplicitlyBlockedFilename(file.name) ||
        !isAllowedPhotoMime(file.type)
      ) {
        localError = "Use JPEG, PNG, or WEBP photos only.";
        continue;
      }
      if (file.size <= 0 || file.size > MAX_PHOTO_BYTES) {
        localError = "Each photo must be 10 MB or smaller.";
        continue;
      }
      next.push({
        id: newId(),
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    onChange(next);
    onClientError?.(localError);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(id: string) {
    const removed = photos.find((p) => p.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    onChange(photos.filter((p) => p.id !== id));
    onClientError?.(null);
  }

  return (
    <div className={styles.photoPicker} data-intake="photo-picker">
      <p className={styles.photoNoteTitle}>
        Have photos? Photos can help us understand what&apos;s going on.
      </p>
      <p className={styles.photoNoteBody}>
        Optional — up to {MAX_PROJECT_PHOTOS} photos (JPEG, PNG, or WEBP), 10 MB
        each. You can finish without uploading.
      </p>

      <div className={styles.photoActions}>
        <label className={styles.photoAddButton} htmlFor={inputId}>
          Add photos
        </label>
        <input
          ref={inputRef}
          id={inputId}
          className={styles.photoFileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          capture="environment"
          disabled={disabled || photos.length >= MAX_PROJECT_PHOTOS}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          data-cta="intake-add-photos"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {photos.length > 0 ? (
        <ul className={styles.photoList}>
          {photos.map((photo) => (
            <li key={photo.id} className={styles.photoItem}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.photoThumb}
                src={photo.previewUrl}
                alt=""
              />
              <div className={styles.photoMeta}>
                <p className={styles.photoName}>{photo.file.name}</p>
                <p className={styles.photoSize}>
                  {(photo.file.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                className={styles.editLink}
                disabled={disabled}
                data-cta="intake-remove-photo"
                onClick={() => removeAt(photo.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function revokePhotoPreviews(photos: SelectedPhoto[]) {
  for (const photo of photos) {
    URL.revokeObjectURL(photo.previewUrl);
  }
}
