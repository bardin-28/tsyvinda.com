"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form, Field, FieldProps } from "formik";
import { Input, Button, Spin, Upload, type InputRef } from "antd";

import { useUser } from "@/shared/contexts/UserContext";

import styles from "./ProfileForm.module.css";
import { initialValuesFromUser } from "./helpers";
import { validate } from "./validation";
import { useProfileSubmit, type ImageAction } from "./submitHandler";
import {
  ACCEPTED_IMAGE_LABEL,
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
  formatMemberSince,
  isAcceptedImageType,
} from "./const";

function getInitials(firstName: string, lastName: string): string {
  const first = (firstName ?? "").trim().charAt(0);
  const last = (lastName ?? "").trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}

export function ProfileForm() {
  const { user, loading, error, refetch } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const firstNameRef = useRef<InputRef>(null);

  const { submitProfile, submitError, setSubmitError } = useProfileSubmit({
    onSuccess: () => {
      resetImageState();
      setIsEditing(false);
      setShowSuccess(true);
    },
  });

  // Object URL preview for a freshly selected file; revoked on change/unmount.
  const pendingPreviewUrl = useMemo(
    () => (pendingFile ? URL.createObjectURL(pendingFile) : null),
    [pendingFile],
  );

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) URL.revokeObjectURL(pendingPreviewUrl);
    };
  }, [pendingPreviewUrl]);

  useEffect(() => {
    if (isEditing) firstNameRef.current?.focus();
  }, [isEditing]);

  function resetImageState() {
    setPendingFile(null);
    setRemoveExisting(false);
    setImageError(null);
  }

  function enterEdit() {
    setShowSuccess(false);
    setSubmitError(null);
    resetImageState();
    setIsEditing(true);
  }

  function selectFile(file: File): boolean {
    if (!isAcceptedImageType(file.type)) {
      setImageError(`Unsupported file. Use ${ACCEPTED_IMAGE_LABEL}.`);
      return false;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setImageError(`Image must be ${MAX_IMAGE_SIZE_LABEL} or smaller.`);
      return false;
    }
    setImageError(null);
    setRemoveExisting(false);
    setPendingFile(file);
    return false; // prevent antd auto-upload
  }

  function removeImage() {
    setPendingFile(null);
    setRemoveExisting(true);
    setImageError(null);
  }

  if (loading && !user) {
    return (
      <div className={styles.statusBlock} role="status" aria-live="polite">
        <Spin />
        <span>Loading your profile…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.statusBlock} role="alert">
        <p className={styles.statusText}>
          {error ? "We couldn't load your profile." : "You are not signed in."}
        </p>
        <Button onClick={() => void refetch()}>Try again</Button>
      </div>
    );
  }

  const currentImageAction: ImageAction = pendingFile
    ? { type: "replace", file: pendingFile }
    : removeExisting
      ? { type: "remove" }
      : { type: "keep" };

  // What the avatar should show right now.
  const previewSrc = pendingPreviewUrl
    ? pendingPreviewUrl
    : removeExisting
      ? null
      : user.profileImageUrl;

  const hasRemovableImage = Boolean(previewSrc);

  return (
    <Formik
      initialValues={initialValuesFromUser(user)}
      enableReinitialize
      validate={validate}
      validateOnBlur
      validateOnChange={false}
      onSubmit={(values, helpers) => {
        // Guard against stray submits fired outside edit mode.
        if (!isEditing) {
          helpers.setSubmitting(false);
          return;
        }
        return submitProfile(values, currentImageAction, helpers);
      }}
    >
      {({ isSubmitting, errors, touched, handleSubmit, resetForm }) => (
        <Form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.avatarRow}>
            <div className={styles.avatar}>
              {previewSrc ? (
                // Remote/preview avatar; plain img avoids next/image remote config
                // on this noindex authenticated page.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewSrc} alt="Profile photo" />
              ) : (
                <span className={styles.avatarInitials} aria-hidden="true">
                  {getInitials(user.firstName, user.lastName)}
                </span>
              )}
            </div>

            {isEditing && (
              <div className={styles.avatarControls}>
                <Upload
                  accept={ACCEPTED_IMAGE_TYPES.join(",")}
                  showUploadList={false}
                  maxCount={1}
                  beforeUpload={selectFile}
                >
                  <Button size="small" aria-label="Upload a new photo">
                    {hasRemovableImage ? "Change photo" : "Upload photo"}
                  </Button>
                </Upload>

                {hasRemovableImage && (
                  <Button
                    size="small"
                    danger
                    onClick={removeImage}
                    aria-label="Remove photo"
                  >
                    Remove
                  </Button>
                )}

                <p className={styles.hint}>
                  {ACCEPTED_IMAGE_LABEL}, up to {MAX_IMAGE_SIZE_LABEL}.
                </p>
                {imageError && (
                  <span className={styles.fieldError}>{imageError}</span>
                )}
              </div>
            )}
          </div>

          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="firstName" className={styles.label}>
                First name
              </label>
              {isEditing ? (
                <Field name="firstName">
                  {({ field }: FieldProps<string>) => (
                    <Input
                      {...field}
                      ref={firstNameRef}
                      id="firstName"
                      size="large"
                      autoComplete="given-name"
                      status={
                        errors.firstName && touched.firstName
                          ? "error"
                          : undefined
                      }
                    />
                  )}
                </Field>
              ) : (
                <p className={styles.value}>{user.firstName}</p>
              )}
              {isEditing && errors.firstName && touched.firstName && (
                <span className={styles.fieldError}>{errors.firstName}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="lastName" className={styles.label}>
                Last name
              </label>
              {isEditing ? (
                <Field name="lastName">
                  {({ field }: FieldProps<string>) => (
                    <Input
                      {...field}
                      id="lastName"
                      size="large"
                      autoComplete="family-name"
                      status={
                        errors.lastName && touched.lastName
                          ? "error"
                          : undefined
                      }
                    />
                  )}
                </Field>
              ) : (
                <p className={styles.value}>{user.lastName}</p>
              )}
              {isEditing && errors.lastName && touched.lastName && (
                <span className={styles.fieldError}>{errors.lastName}</span>
              )}
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Email</span>
              <p className={styles.value}>
                {user.email}
                <span
                  className={
                    user.emailVerified
                      ? styles.badgeVerified
                      : styles.badgeUnverified
                  }
                >
                  {user.emailVerified ? "Verified" : "Unverified"}
                </span>
              </p>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Member since</span>
              <p className={styles.value}>{formatMemberSince(user.createdAt)}</p>
            </div>

            <div className={styles.field}>
              <span className={styles.label}>Account ID</span>
              <p className={styles.valueMuted}>{user.id}</p>
            </div>
          </div>

          {submitError && (
            <div className={styles.submitError} role="alert">
              {submitError}
            </div>
          )}

          {showSuccess && !isEditing && (
            <div className={styles.submitSuccess} role="status">
              Profile updated.
            </div>
          )}

          <div className={styles.actions}>
            {isEditing ? (
              <>
                <Button
                  key="profile-save"
                  type="primary"
                  htmlType="submit"
                  loading={isSubmitting}
                  className={styles.saveBtn}
                >
                  {isSubmitting ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  key="profile-cancel"
                  htmlType="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    resetForm();
                    resetImageState();
                    setSubmitError(null);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                key="profile-edit"
                type="primary"
                htmlType="button"
                onClick={enterEdit}
                className={styles.saveBtn}
                aria-label="Edit profile"
              >
                Edit profile
              </Button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  );
}
