import type { APIRoute } from "astro";
import { createMailTransport, resolveInboxEmail } from "../../lib/email/mailer";
import { createContactEmailTemplate } from "../../lib/email/templates/contactEmail";
import { getRequestIp, isRateLimited } from "../../lib/forms/rateLimit";

export const prerender = false;

type ContactPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-()\s]{8,20}$/;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

const normalize = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const validatePayload = (payload: ContactPayload) => {
  const errors: Partial<Record<keyof ContactPayload, string>> = {};

  if (payload.firstName.length < 2) {
    errors.firstName = "Please enter your first name.";
  }

  if (payload.lastName.length < 2) {
    errors.lastName = "Please enter your last name.";
  }

  if (!phonePattern.test(payload.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!emailPattern.test(payload.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!payload.subject) {
    errors.subject = "Please choose a subject.";
  }

  if (payload.message.length < 10) {
    errors.message = "Please enter at least 10 characters.";
  }

  return errors;
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const ipAddress = getRequestIp(request);
    if (
      isRateLimited(`contact:${ipAddress}`, {
        limit: 5,
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

    const body = await request.json();

    if (normalize(body.website)) {
      return json({
        ok: true,
        message:
          "Your message has been sent to our team. We’ll review your enquiry and get back to you as soon as possible.",
      });
    }

    const payload: ContactPayload = {
      firstName: normalize(body.firstName),
      lastName: normalize(body.lastName),
      phone: normalize(body.phone),
      email: normalize(body.email),
      subject: normalize(body.subject),
      message: normalize(body.message),
    };

    const errors = validatePayload(payload);

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
      console.error("Contact form SMTP environment variables are missing.", error);

      return json(
        {
          ok: false,
          message:
            "The contact form is not configured correctly yet. Please try again later.",
        },
        500,
      );
    }

    const fullName = `${payload.firstName} ${payload.lastName}`.trim();
    const template = createContactEmailTemplate(payload);

    await mailTransport.transporter.sendMail({
      from: `"ProPlumb Website" <${mailTransport.settings.fromEmail}>`,
      to: resolveInboxEmail(import.meta.env, "contact"),
      replyTo: {
        name: fullName,
        address: payload.email,
      },
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    return json({
      ok: true,
      message:
        "Your message has been sent to our team. We’ll review your enquiry and get back to you as soon as possible.",
    });
  } catch (error) {
    console.error("Failed to send contact form email:", error);

    return json(
      {
        ok: false,
        message:
          "We couldn’t send your message right now. Please try again in a moment.",
      },
      500,
    );
  }
};
