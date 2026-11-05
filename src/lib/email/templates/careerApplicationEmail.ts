import {
  escapeHtml,
  formatSubmittedAt,
  renderDetailsTable,
  renderEmailShell,
  renderMessageCard,
  type EmailTemplate,
} from "./shared";

type CareerApplicationEmailPayload = {
  cvFileName: string;
  message: string;
  roleTitle: string;
};

export const createCareerApplicationEmailTemplate = ({
  cvFileName,
  message,
  roleTitle,
}: CareerApplicationEmailPayload): EmailTemplate => {
  const submittedAt = formatSubmittedAt();
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");

  return {
    subject: `Career Application: ${roleTitle}`,
    text: [
      "New career application submission",
      "",
      `Role: ${roleTitle}`,
      `CV Attachment: ${cvFileName}`,
      `Submitted: ${submittedAt} (Melbourne time)`,
      "",
      "Message / Cover Letter:",
      message,
    ].join("\n"),
    html: renderEmailShell({
      kicker: "ProPlumb Careers",
      title: "New Career Application",
      intro:
        "A candidate has submitted a new application through the ProPlumb careers page.",
      bodyHtml: `
        <tr>
          <td style="padding: 28px 36px 8px;">
            ${renderDetailsTable("Application Details", [
              { label: "Role", value: roleTitle },
              { label: "CV Attachment", value: cvFileName },
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
          The applicant's CV is attached to this email for review.
        </p>
      `,
    }),
  };
};
