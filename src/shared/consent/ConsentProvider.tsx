"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  ALL_ACCEPTED,
  ALL_REJECTED,
  parseConsent,
  readConsentCookieValue,
  subscribeToConsent,
  writeConsent,
} from "./consentStorage";
import type { ConsentPreferences } from "./types";

/** On the server (and during hydration) there is no cookie to read yet. */
function readServerSnapshot(): null {
  return null;
}

export type ConsentContextValue = {
  /** Effective choice; everything optional is off until the visitor decides. */
  preferences: ConsentPreferences;
  /** False until the consent cookie has been read in the browser (never on the server). */
  isReady: boolean;
  /** The visitor has made a choice (banner no longer needed). */
  hasDecided: boolean;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  /** Saves a custom choice (preference center "Confirm my choices"). */
  savePreferences: (preferences: ConsentPreferences) => void;
  openPreferences: () => void;
  /** Closes the preference center without saving. */
  closePreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue | undefined>(
  undefined,
);

type ConsentProviderProps = {
  children: ReactNode;
};

export function ConsentProvider({ children }: ConsentProviderProps) {
  // Pages are prerendered and edge-cached: the cookie is read in the browser only. The server
  // snapshot is null, so `isReady` stays false until hydration has finished.
  const rawConsent: string | null = useSyncExternalStore(
    subscribeToConsent,
    readConsentCookieValue,
    readServerSnapshot,
  );
  const consent = useMemo(() => parseConsent(rawConsent), [rawConsent]);
  const isReady = rawConsent !== null;
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);

  const savePreferences = useCallback((preferences: ConsentPreferences) => {
    writeConsent(preferences);
    setIsPreferencesOpen(false);
  }, []);

  const acceptAll = useCallback(
    () => savePreferences(ALL_ACCEPTED),
    [savePreferences],
  );
  const rejectAll = useCallback(
    () => savePreferences(ALL_REJECTED),
    [savePreferences],
  );
  const openPreferences = useCallback(() => setIsPreferencesOpen(true), []);
  const closePreferences = useCallback(() => setIsPreferencesOpen(false), []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      preferences: consent ? { analytics: consent.analytics } : ALL_REJECTED,
      isReady,
      hasDecided: consent !== null,
      isPreferencesOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      openPreferences,
      closePreferences,
    }),
    [
      consent,
      isReady,
      isPreferencesOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      openPreferences,
      closePreferences,
    ],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
}
