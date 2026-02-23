"use client";

/**
 * EPIC-10: Presentation Viewer Component (EP10-FE-03)
 * 
 * PPTX/PPT viewer using Google Docs Viewer or PDF conversion
 */

import { DocumentViewer } from "./DocumentViewer";

interface PresentationViewerProps {
  presentationUrl: string | null;
  pdfUrl?: string | null;
  filename?: string | null;
  className?: string;
}

export function PresentationViewer({ presentationUrl, pdfUrl, filename, className }: PresentationViewerProps) {
  // Reuse DocumentViewer component (same functionality)
  return (
    <DocumentViewer
      documentUrl={presentationUrl}
      pdfUrl={pdfUrl}
      filename={filename}
      className={className}
    />
  );
}
