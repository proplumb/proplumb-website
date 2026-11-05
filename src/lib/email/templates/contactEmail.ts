import {
  escapeHtml,
  formatSubmittedAt,
  renderDetailsTable,
  renderEmailShell,
  renderMessageCard,
  type EmailTemplate,
} from "./shared";

type ContactEmailPayload = {
  email: string;
  firstName: string;
  lastName: string;
  message: string;
  phone: string;
  subject: string;
};

export const createContactEmailTemplate = ({
  email,
  firstName,
  lastName,
  message,
  phone,
  subject,
}: ContactEmailPayload): EmailTemplate => {
  const fullName = `${firstName} ${lastName}`.trim();
  const submittedAt = formatSubmittedAt();
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

  return {
    subject: `Website Contact: ${subject}`,
    text: [
      "New website contact submission",
      "",
      `Name: ${fullName}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Subject: ${subject}`,
      `Submitted: ${submittedAt} (Melbourne time)`,
      "",
      "Message:",
      message,
    ].join("\n"),
    html: renderEmailShell({
      kicker: "ProPlumb Website Enquiry",
      title: "New Contact Form Submission",
      intro: "A new enquiry has been submitted through the ProPlumb website.",
      bodyHtml: `
        <tr>
          <td style="padding: 28px 36px 8px;">
            ${renderDetailsTable("Contact Details", [
              { label: "Name", value: fullName },
              {
                label: "Email",
                value: `<a href="mailto:${escapeHtml(email)}" style="color: #2f6b36; text-decoration: none;">${escapeHtml(email)}</a>`,
                isHtml: true,
              },
              { label: "Phone", value: phone },
              { label: "Subject", value: subject },
              { label: "Submitted", value: `${submittedAt} (Melbourne time)` },
            ])}
          </td>
        </tr>
        <tr>
          <td style="padding: 20px 36px 12px;">
            ${renderMessageCard(safeMessage)}
          </td>
        </tr>
      `,
      footerHtml: `
        <p style="margin: 0; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.7; color: #6b7368;">
          Replying to this email will contact
          <strong style="color: #202420;">${escapeHtml(fullName)}</strong>
          directly at
          <a href="mailto:${escapeHtml(email)}" style="color: #2f6b36; text-decoration: none;">
            ${escapeHtml(email)}
          </a>.
        </p>
      `,
    }),
  };
};
