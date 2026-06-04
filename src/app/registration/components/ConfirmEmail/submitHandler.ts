import { useEffect, useRef, useState } from "react";

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

export function useConfirmEmail(token: string) {
  const [status, setStatus] = useState<ConfirmStatus>(() =>
    isValidTokenShape(token) ? "verifying" : "error",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(
    isValidTokenShape(token)
      ? null
      : "This confirmation link is missing or malformed.",
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
          setErrorMessage(
            data?.message ?? "This confirmation link is invalid or has expired.",
          );
        } else {
          setErrorMessage("Unexpected error. Try again.");
        }
        setStatus("error");
      });

    return () => {
      active = false;
    };
  }, [token]);

  return { status, errorMessage };
}
