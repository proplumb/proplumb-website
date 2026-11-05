export type EmailTemplate = {
  html: string;
  subject: string;
  text: string;
};

type EmailShellOptions = {
  bodyHtml: string;
  footerHtml?: string;
  intro: string;
  kicker: string;
  title: string;
};

export const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const formatSubmittedAt = () =>
  new Intl.DateTimeFormat("en-AU", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Australia/Melbourne",
  }).format(new Date());

export const renderEmailShell = ({
  bodyHtml,
  footerHtml = "",
  intro,
  kicker,
  title,
}: EmailShellOptions) => `
  <div style="margin: 0; padding: 32px 16px; background-color: #f2f4f1;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 680px; margin: 0 auto; border-collapse: collapse; background: #ffffff; border: 1px solid #d9e1d5;">
      <tr>
        <td style="padding: 0;">
          <div style="background: linear-gradient(135deg, #101311 0%, #1e2a1e 100%); padding: 32px 36px; color: #ffffff;">
            <p style="margin: 0 0 10px; font-family: Arial, sans-serif; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #b9d7b0;">
              ${escapeHtml(kicker)}
            </p>
            <h1 style="margin: 0; font-family: Arial, sans-serif; font-size: 30px; line-height: 1.2; font-weight: 700; color: #ffffff;">
              ${escapeHtml(title)}
            </h1>
            <p style="margin: 14px 0 0; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.7; color: #d8e3d4;">
              ${escapeHtml(intro)}
            </p>
          </div>
        </td>
      </tr>
      ${bodyHtml}
      ${
        footerHtml
          ? `<tr><td style="padding: 8px 36px 32px;">${footerHtml}</td></tr>`
          : ""
      }
    </table>
  </div>
`;

export const renderDetailsTable = (
  heading: string,
  rows: Array<{ label: string; value: string; isHtml?: boolean }>,
) => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse: separate; border-spacing: 0; background: #f8faf7; border: 1px solid #e2e8df;">
    <tr>
      <td colspan="2" style="padding: 18px 22px; border-bottom: 1px solid #e2e8df; font-family: Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #3e5d3d;">
        ${escapeHtml(heading)}
      </td>
    </tr>
    ${rows
      .map(
        (row, index) => `
          <tr>
            <td style="width: 160px; padding: 16px 22px; ${
              index < rows.length - 1 ? "border-bottom: 1px solid #e2e8df;" : ""
            } font-family: Arial, sans-serif; font-size: 13px; font-weight: 700; color: #445240;">
              ${escapeHtml(row.label)}
            </td>
            <td style="padding: 16px 22px; ${
              index < rows.length - 1 ? "border-bottom: 1px solid #e2e8df;" : ""
            } font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #111111;">
              ${row.isHtml ? row.value : escapeHtml(row.value)}
            </td>
          </tr>
        `,
      )
      .join("")}
  </table>
`;

export const renderMessageCard = (messageHtml: string) => `
  <div style="border: 1px solid #e2e8df; background: #ffffff;">
    <div style="padding: 18px 22px; border-bottom: 1px solid #e2e8df; font-family: Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #3e5d3d; background: #f8faf7;">
      Message
    </div>
    <div style="padding: 22px; font-family: Arial, sans-serif; font-size: 15px; line-height: 1.8; color: #1b1b1b;">
      ${messageHtml}
    </div>
  </div>
`;
