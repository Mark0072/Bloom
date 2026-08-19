"use client";

import { useEffect, useState } from "react";
import { isSpeechSupported, speak, stopSpeaking } from "@/lib/speech";
import { useBloomStore } from "@/store/useBloomStore";
import { t } from "@/lib/i18n";

export default function SpeakButton({ text }: { text: string }) {
  const language = useBloomStore((s) => s.language);
  const readAloudEnabled = useBloomStore((s) => s.accessibility.readAloud);
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(isSpeechSupported());
  }, []);

  function handleClick() {
    if (!supported) return;
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    speak(text, language);
    setSpeaking(true);
    const estimatedMs = Math.min(20000, text.length * 60);
    window.setTimeout(() => setSpeaking(false), estimatedMs);
  }

  if (!readAloudEnabled) return null;

  if (!supported) {
    return <p className="text-xs bloom-muted">{t("speakUnsupported", language)}</p>;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bloom-btn-secondary flex items-center gap-2 rounded-xl px-3 py-2 text-sm"
    >
      <span aria-hidden>{speaking ? "⏸" : "🔊"}</span>
      {t("speakAloud", language)}
    </button>
  );
}
