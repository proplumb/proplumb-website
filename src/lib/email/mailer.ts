import nodemailer from "nodemailer";

type MailEnvironment = {
  CAREERS_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
  SMTP_HOST?: string;
  SMTP_PASS?: string;
  SMTP_PORT?: string;
  SMTP_SECURE?: string;
  SMTP_USER?: string;
};

const DEFAULT_INBOX = "admin@proplumb.com.au";

const readEnvValue = (
  env: MailEnvironment,
  key: keyof MailEnvironment,
) => {
  const runtimeValue =
    typeof process !== "undefined" && process.env
      ? process.env[key]
      : undefined;

  return env[key] ?? runtimeValue;
};

const resolveMergedEnv = (env: MailEnvironment) => ({
  CAREERS_TO_EMAIL: readEnvValue(env, "CAREERS_TO_EMAIL"),
  CONTACT_FROM_EMAIL: readEnvValue(env, "CONTACT_FROM_EMAIL"),
  CONTACT_TO_EMAIL: readEnvValue(env, "CONTACT_TO_EMAIL"),
  SMTP_HOST: readEnvValue(env, "SMTP_HOST"),
  SMTP_PASS: readEnvValue(env, "SMTP_PASS"),
  SMTP_PORT: readEnvValue(env, "SMTP_PORT"),
  SMTP_SECURE: readEnvValue(env, "SMTP_SECURE"),
  SMTP_USER: readEnvValue(env, "SMTP_USER"),
});

export const resolveMailSettings = (env: MailEnvironment) => {
  const mergedEnv = resolveMergedEnv(env);
  const smtpHost = mergedEnv.SMTP_HOST;
  const smtpPort = Number(mergedEnv.SMTP_PORT ?? "2525");
  const smtpUser = mergedEnv.SMTP_USER;
  const smtpPass = mergedEnv.SMTP_PASS;
  const smtpSecure =
    String(mergedEnv.SMTP_SECURE ?? "false").toLowerCase() === "true";
  const fromEmail = mergedEnv.CONTACT_FROM_EMAIL || DEFAULT_INBOX;

  if (!smtpHost || !smtpUser || !smtpPass || !smtpPort) {
    const missingKeys = [
      !smtpHost ? "SMTP_HOST" : "",
      !smtpUser ? "SMTP_USER" : "",
      !smtpPass ? "SMTP_PASS" : "",
      !smtpPort ? "SMTP_PORT" : "",
    ].filter(Boolean);

    throw new Error(
      `SMTP environment variables are missing: ${missingKeys.join(", ")}`,
    );
  }

  return {
    fromEmail,
    smtpHost,
    smtpPass,
    smtpPort,
    smtpSecure,
    smtpUser,
  };
};

export const createMailTransport = (env: MailEnvironment) => {
  const settings = resolveMailSettings(env);

  return {
    settings,
    transporter: nodemailer.createTransport({
      host: settings.smtpHost,
      port: settings.smtpPort,
      secure: settings.smtpSecure,
      auth: {
        user: settings.smtpUser,
        pass: settings.smtpPass,
      },
    }),
  };
};

export const resolveInboxEmail = (
  env: MailEnvironment,
  type: "contact" | "careers",
) => {
  const mergedEnv = resolveMergedEnv(env);

  if (type === "careers") {
    return (
      mergedEnv.CAREERS_TO_EMAIL ||
      mergedEnv.CONTACT_TO_EMAIL ||
      DEFAULT_INBOX
    );
  }

  return mergedEnv.CONTACT_TO_EMAIL || DEFAULT_INBOX;
};
