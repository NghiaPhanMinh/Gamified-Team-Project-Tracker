const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

function normaliseText(value: string, label: string, maxLength: number) {
  const normalised = value.trim().replace(/\s+/g, " ");

  if (normalised.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }

  return normalised;
}

export function validateExternalUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid evidence link.");
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Evidence links must use http or https.");
  }

  return url.toString();
}

export function validateEvidenceMetadata(input: {
  type: "note" | "link" | "image" | "pdf";
  note?: string;
  url?: string;
  hasStorageId: boolean;
  fileName?: string;
  contentType?: string;
  fileSize?: number;
}) {
  if (input.type === "note") {
    const note = normaliseText(input.note ?? "", "Evidence note", 2_000);

    if (!note) {
      throw new Error("Write a short evidence note.");
    }

    return { note };
  }

  if (input.type === "link") {
    return {
      url: validateExternalUrl(input.url ?? ""),
      note: input.note
        ? normaliseText(input.note, "Link description", 500)
        : undefined,
    };
  }

  if (!input.hasStorageId) {
    throw new Error("Upload the evidence file before saving it.");
  }

  const fileName = normaliseText(input.fileName ?? "", "File name", 180);
  const contentType = input.contentType ?? "";
  const fileSize = input.fileSize ?? 0;

  if (!fileName || !Number.isInteger(fileSize) || fileSize <= 0) {
    throw new Error("The uploaded file metadata is incomplete.");
  }

  if (input.type === "image") {
    if (!IMAGE_TYPES.has(contentType)) {
      throw new Error("Images must be JPEG, PNG, WebP, or GIF files.");
    }

    if (fileSize > MAX_IMAGE_BYTES) {
      throw new Error("Images must be 5 MB or smaller.");
    }
  } else {
    if (contentType !== "application/pdf") {
      throw new Error("PDF evidence must be an application/pdf file.");
    }

    if (fileSize > MAX_PDF_BYTES) {
      throw new Error("PDF files must be 10 MB or smaller.");
    }
  }

  return {
    note: input.note
      ? normaliseText(input.note, "File description", 500)
      : undefined,
    fileName,
    contentType,
    fileSize,
  };
}

export function validateReviewComment(
  status: "approved" | "changes_requested",
  value: string,
) {
  const comment = normaliseText(value, "Review comment", 1_000);

  if (status === "changes_requested" && !comment) {
    throw new Error("Explain what should change before requesting revisions.");
  }

  return comment || undefined;
}
