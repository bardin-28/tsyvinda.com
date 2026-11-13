import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { ApiError } from "@/api";
import { confirmEmail } from "@/api/auth";

// Backend confirmation tokens are 32-128 chars (auth.schema.ts). We shape-check
// before hitting the network; the backend stays the source of truth and returns
// 400 for invalid/used/expired tokens.
const TOKEN_MIN_LENGTH = 32;
const TOKEN_MAX_LENGTH = 128;

export function isValidTokenShape(token: string): boolean {
  return token.length >= TOKEN_MIN_LENGTH && token.length <= TOKEN_MAX_LENGTH;
}

export type ConfirmStatus = "verifying" | "success" | "error";

// Keys of the "auth.errors" messages shown when the backend gives no message.
type ConfirmErrorKey =
  "confirmLinkMalformed" | "confirmLinkInvalid" | "unexpected";

type ConfirmError =
  | { kind: "translated"; key: ConfirmErrorKey }
  | { kind: "backend"; message: string };

export function useConfirmEmail(token: string) {
  const t = useTranslations("auth.errors");
  const [status, setStatus] = useState<ConfirmStatus>(() =>
    isValidTokenShape(token) ? "verifying" : "error",
  );
  const [confirmError, setConfirmError] = useState<ConfirmError | null>(() =>
    isValidTokenShape(token)
      ? null
      : { kind: "translated", key: "confirmLinkMalformed" },
  );

  // Confirmation is single-use: a second POST returns 400 "already used". The
  // ref guards against React's dev double-invoke firing the request twice.
  const hasRun = useRef(false);

  useEffect(() => {
    if (!isValidTokenShape(token)) return;
    if (hasRun.current) return;
    hasRun.current = true;

    let active = true;
    confirmEmail(token)
      .then(() => {
        if (active) setStatus("success");
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError) {
          const data = err.data as { message?: string } | null;
          setConfirmError(
            data?.message
              ? { kind: "backend", message: data.message }
              : { kind: "translated", key: "confirmLinkInvalid" },
          );
        } else {
          setConfirmError({ kind: "translated", key: "unexpected" });
        }
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [token]);

  let errorMessage: string | null = null;
  if (confirmError?.kind === "backend") errorMessage = confirmError.message;
  if (confirmError?.kind === "translated") errorMessage = t(confirmError.key);

  return { status, errorMessage };
}
