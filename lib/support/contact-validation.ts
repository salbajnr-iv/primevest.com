export const CONTACT_CATEGORIES = [
  "support",
  "account",
  "trading",
  "verification",
  "withdrawal",
  "complaint",
  "other",
] as const;

export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export interface ContactSubmissionPayload {
  name: string;
  email: string;
  category: ContactCategory;
  message: string;
  subject?: string;
}

export interface ContactValidationResult {
  isValid: boolean;
  errors: Partial<Record<keyof ContactSubmissionPayload, string>>;
  values?: ContactSubmissionPayload;
}

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_SUBJECT_LENGTH = 150;
const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 10;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactSubmission(input: unknown): ContactValidationResult {
  const errors: ContactValidationResult["errors"] = {};

  if (!input || typeof input !== "object") {
    return {
      isValid: false,
      errors: {
        name: "Please provide your full name.",
        email: "Please provide a valid email address.",
        category: "Please choose a support category.",
        message: "Please include a message with enough detail.",
      },
    };
  }

  const raw = input as Record<string, unknown>;

  const name = String(raw.name ?? "").trim();
  const email = String(raw.email ?? "").trim().toLowerCase();
  const category = String(raw.category ?? "").trim() as ContactCategory;
  const message = String(raw.message ?? "").trim();
  const subjectValue = raw.subject == null ? "" : String(raw.subject).trim();
  const subject = subjectValue.length > 0 ? subjectValue : undefined;

  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (!email) {
    errors.email = "Email is required.";
  } else if (email.length > MAX_EMAIL_LENGTH || !emailRegex.test(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!CONTACT_CATEGORIES.includes(category)) {
    errors.category = "Please select a valid category.";
  }

  if (!message) {
    errors.message = "Message is required.";
  } else if (message.length < MIN_MESSAGE_LENGTH) {
    errors.message = `Message must be at least ${MIN_MESSAGE_LENGTH} characters.`;
  } else if (message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;
  }

  if (subject && subject.length > MAX_SUBJECT_LENGTH) {
    errors.subject = `Subject must be ${MAX_SUBJECT_LENGTH} characters or fewer.`;
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    values: {
      name,
      email,
      category,
      message,
      ...(subject ? { subject } : {}),
    },
  };
}
