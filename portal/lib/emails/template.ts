/**
 * Génère un email HTML stylé Olympe Production.
 * Compatible Gmail, Outlook, Apple Mail (styles inline + tables).
 */

const ACCENT = "#F15A24";
const BG = "#05051A";
const BG_2 = "#080A25";
const FG = "#FFFFFF";
const MUTE = "rgba(255,255,255,0.58)";
const LINE = "rgba(255,255,255,0.10)";

export type EmailButton = { label: string; url: string };

export function renderEmail(opts: {
  preheader: string;
  title: string;
  intro: string;
  contentHtml?: string;
  button?: EmailButton;
  footnote?: string;
}): string {
  const { preheader, title, intro, contentHtml = "", button, footnote } = opts;

  const buttonHtml = button
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
         <tr><td style="border-radius:999px;background:${ACCENT};">
           <a href="${button.url}"
              style="display:inline-block;padding:16px 32px;font-family:'Inter Tight',Arial,sans-serif;font-size:14px;font-weight:500;letter-spacing:0.04em;color:#fff;text-decoration:none;border-radius:999px;">
             ${button.label}
           </a>
         </td></tr>
       </table>`
    : "";

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <meta name="color-scheme" content="dark light" />
  <meta name="supported-color-schemes" content="dark light" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:'Inter Tight',Arial,sans-serif;color:${FG};">
  <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${BG_2};border:1px solid ${LINE};border-radius:6px;overflow:hidden;">
        <!-- Header / logo -->
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid ${LINE};">
          <div style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:700;text-transform:uppercase;letter-spacing:0.005em;line-height:1;font-size:18px;">
            <div><span style="color:${ACCENT};">OLY</span><span style="color:${FG};">MPE</span></div>
            <div><span style="color:${FG};">PRODU</span><span style="color:${ACCENT};">CTION</span></div>
          </div>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <h1 style="margin:0 0 16px;font-family:'Cormorant Garamond',Georgia,serif;font-weight:400;font-size:36px;line-height:1.05;letter-spacing:-0.018em;color:${FG};">
            ${title}
          </h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:${MUTE};">${intro}</p>
          ${contentHtml}
          ${buttonHtml}
          ${footnote ? `<p style="margin:24px 0 0;font-size:12px;line-height:1.55;color:${MUTE};">${footnote}</p>` : ""}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid ${LINE};font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10.5px;letter-spacing:0.16em;text-transform:uppercase;color:${MUTE};">
          Olympe Production · Studio de production audiovisuelle<br/>
          <a href="mailto:contact@olympeproduction.com" style="color:${MUTE};text-decoration:underline;">contact@olympeproduction.com</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
