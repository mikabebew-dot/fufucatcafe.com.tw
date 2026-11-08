"use client";

export function PrintButton() {
  return (
    <button type="button" className="btn qr-print" onClick={() => window.print()}>
      列印
    </button>
  );
}
