"use client";

import { useEffect } from "react";
import { useBloomStore } from "@/store/useBloomStore";

/** Keeps <html lang> in sync with the selected language so screen readers use the right pronunciation. */
export default function HtmlLangUpdater() {
  const language = useBloomStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
