import type { APIRoute } from "astro";
import {
  CAREER_APPLICATION_MAX_FILE_SIZE_BYTES,
  isAllowedCareerCvFile,
} from "../../../lib/forms/careerApplication";
import { createMailTransport, resolveInboxEmail } from "../../../lib/email/mailer";
import { createCareerApplicationEmailTemplate } from "../../../lib/email/templates/careerApplicationEmail";
import { getRequestIp, isRateLimited } from "../../../lib/forms/rateLimit";

export const prerender = false;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const normalize = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim() : "";

export const POST: APIRoute = async ({ request }) => {
  try {
    const ipAddress = getRequestIp(request);
    if (
      isRateLimited(`career:${ipAddress}`, {
        limit: 4,
        windowMs: 15 * 60 * 1000,
      })
    ) {
      return json(
        {
          ok: false,
          message: "Too many submissions. Please try again shortly.",
        },
        429,
      );
    }

    const formData = await request.formData();
    const roleTitle = normalize(formData.get("roleTitle"));
    const message = normalize(formData.get("message"));
    const cvFile = formData.get("cv");

    if (normalize(formData.get("website"))) {
      return json({
        ok: true,
        message:
          "Your application has been sent to our team. We’ll review it and get back to you if there’s a fit.",
      });
    }

    const errors: Record<string, string> = {};

    if (!roleTitle) {
      errors.roleTitle = "The role title is missing. Please refresh and try again.";
    }

    if (!(cvFile instanceof File) || !cvFile.size) {
      errors.cv = "Please upload your CV.";
    } else {
      if (!isAllowedCareerCvFile(cvFile)) {
        errors.cv = "Please upload a PDF, DOC, or DOCX file.";
      } else if (cvFile.size > CAREER_APPLICATION_MAX_FILE_SIZE_BYTES) {
        errors.cv = "Please upload a file smaller than 5MB.";
      }
    }

    if (message.length < 10) {
      errors.message = "Please enter at least 10 characters.";
    }

    if (Object.keys(errors).length > 0) {
      return json(
        {
          ok: false,
          message: "Please fix the highlighted fields and try again.",
          errors,
        },
        400,
      );
    }

    let mailTransport;
    try {
      mailTransport = createMailTransport(import.meta.env);
    } catch (error) {
      console.error("Career application SMTP environment variables are missing.", error);

      return json(
        {
          ok: false,
          message:
            "The careers form is not configured correctly yet. Please try again later.",
        },
        500,
      );
    }

    const template = createCareerApplicationEmailTemplate({
      cvFileName: cvFile.name,
      message,
      roleTitle,
    });

    await mailTransport.transporter.sendMail({
      from: `"ProPlumb Careers" <${mailTransport.settings.fromEmail}>`,
      to: resolveInboxEmail(import.meta.env, "careers"),
      subject: template.subject,
      text: template.text,
      html: template.html,
      attachments: [
        {
          filename: cvFile.name,
          content: Buffer.from(await cvFile.arrayBuffer()),
          contentType: cvFile.type || undefined,
        },
      ],
    });

    return json({
      ok: true,
      message:
        "Your application has been sent to our team. We’ll review it and get back to you if there’s a fit.",
    });
  } catch (error) {
    console.error("Failed to send career application email:", error);

    return json(
      {
        ok: false,
        message:
          "We couldn’t send your application right now. Please try again in a moment.",
      },
      500,
    );
  }
};
