"use client";

import { useUser } from "@/shared/contexts/UserContext";

import styles from "./ApprovalBanner.module.css";

export function ApprovalBanner() {
  const { user } = useUser();

  if (!user || user.approvedByAdmin) {
    return null;
  }

  return (
    <div className={styles.banner} role="status">
      <span className={styles.text}>
        Your account is awaiting admin approval. Some actions stay locked until
        an admin approves it.
      </span>
    </div>
  );
}
