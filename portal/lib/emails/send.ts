import { Resend } from "resend";
import { renderEmail, type EmailButton } from "./template";

let _resend: Resend | null = null;
function client() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY!);
  return _resend;
}

type SendArgs = {
  to: string | string[];
  subject: string;
  preheader: string;
  title: string;
  intro: string;
  contentHtml?: string;
  button?: EmailButton;
  footnote?: string;
  replyTo?: string;
};

export async function sendBrandedEmail(args: SendArgs) {
  const html = renderEmail({
    preheader: args.preheader,
    title: args.title,
    intro: args.intro,
    contentHtml: args.contentHtml,
    button: args.button,
    footnote: args.footnote,
  });

  const from = process.env.EMAIL_FROM ?? "Olympe Production <onboarding@resend.dev>";
  const replyTo = args.replyTo ?? process.env.EMAIL_REPLY_TO;

  return client().emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html,
    replyTo,
  });
}

// ====== Helpers métier ======

const SITE = () => process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const ADMIN_EMAIL = () => process.env.ADMIN_EMAIL ?? "contact@olympeproduction.com";

const STAGE_LABELS: Record<string, string> = {
  preprod: "Pré-production",
  prod: "Production",
  postprod: "Post-production",
};

export async function emailWelcomeClient(p: {
  to: string;
  projectName: string;
  loginUrl: string;
}) {
  return sendBrandedEmail({
    to: p.to,
    subject: `🎬 Bienvenue sur l'espace client — ${p.projectName}`,
    preheader: `Votre projet ${p.projectName} est prêt à être suivi.`,
    title: `Votre projet est <em style="font-style:italic;color:#F15A24;">en route</em>.`,
    intro: `Olympe Production a ouvert votre espace client pour le projet « ${escape(p.projectName)} ». Vous pourrez y suivre l'avancement, valider les étapes et échanger avec l'équipe.`,
    button: { label: "Accéder à mon espace", url: p.loginUrl },
    footnote: "Ce lien vous connecte automatiquement, sans mot de passe.",
  });
}

export async function emailValidationRequest(p: {
  to: string;
  projectName: string;
  stage: "preprod" | "prod" | "postprod";
  url: string;
  filesPreviewHtml?: string;
  isReminder?: boolean;
  reminderCount?: number;
}) {
  const stageLabel = STAGE_LABELS[p.stage];
  const subject = p.isReminder
    ? `🔔 Rappel n°${p.reminderCount ?? 1} — ${p.projectName} attend votre validation`
    : `🎬 ${p.projectName} — Étape ${stageLabel} prête à valider`;
  return sendBrandedEmail({
    to: p.to,
    subject,
    preheader: `L'étape ${stageLabel} est prête. Cliquez pour la vérifier.`,
    title: p.isReminder
      ? `Petit <em style="font-style:italic;color:#F15A24;">rappel</em>`
      : `Étape <em style="font-style:italic;color:#F15A24;">${stageLabel}</em> à valider`,
    intro: `L'étape <b>${stageLabel}</b> du projet « ${escape(p.projectName)} » est terminée et attend votre validation. Prenez quelques minutes pour vérifier ce qui a été produit, puis validez ou demandez des modifications directement depuis votre espace.`,
    contentHtml: p.filesPreviewHtml ?? "",
    button: { label: "Valider cette étape", url: p.url },
    footnote: p.isReminder
      ? "Vous recevez ce rappel automatiquement chaque jour à 09h00 (heure de La Réunion) tant qu'aucune réponse n'est enregistrée. Il s'arrêtera dès votre validation."
      : "À votre rythme — l'équipe Olympe est là pour répondre à vos questions.",
  });
}

export async function emailProgressUpdate(p: {
  to: string; projectName: string; progress: number; url: string;
}) {
  return sendBrandedEmail({
    to: p.to,
    subject: `📈 ${p.projectName} — avancement à ${p.progress}%`,
    preheader: `Votre projet a progressé à ${p.progress}%.`,
    title: `Avancement : <em style="font-style:italic;color:#F15A24;">${p.progress}%</em>`,
    intro: `L'équipe a mis à jour l'avancement de votre projet « ${escape(p.projectName)} ».`,
    button: { label: "Voir mon projet", url: p.url },
  });
}

export async function emailStageChange(p: {
  to: string; projectName: string; stage: "preprod"|"prod"|"postprod"; url: string;
}) {
  const lbl = STAGE_LABELS[p.stage];
  return sendBrandedEmail({
    to: p.to,
    subject: `🎬 ${p.projectName} — Démarrage de la ${lbl}`,
    preheader: `Nouvelle étape : ${lbl}.`,
    title: `Étape <em style="font-style:italic;color:#F15A24;">${lbl}</em> en cours`,
    intro: `Le projet « ${escape(p.projectName)} » entre en phase de ${lbl}. On avance !`,
    button: { label: "Voir mon projet", url: p.url },
  });
}

export async function emailNewFile(p: {
  to: string; projectName: string; fileName: string; url: string;
}) {
  return sendBrandedEmail({
    to: p.to,
    subject: `📎 ${p.projectName} — Nouveau fichier à consulter`,
    preheader: `${p.fileName} a été ajouté à votre projet.`,
    title: `Un nouveau fichier <em style="font-style:italic;color:#F15A24;">vous attend</em>`,
    intro: `Le fichier « ${escape(p.fileName)} » vient d'être ajouté à votre espace projet.`,
    button: { label: "Consulter le fichier", url: p.url },
  });
}

export async function emailCommentToClient(p: {
  to: string; projectName: string; body: string; url: string;
}) {
  return sendBrandedEmail({
    to: p.to,
    subject: `💬 ${p.projectName} — Nouveau message de l'équipe`,
    preheader: `Un message vous attend.`,
    title: `Nouveau <em style="font-style:italic;color:#F15A24;">message</em>`,
    intro: `L'équipe Olympe vous a laissé un commentaire sur « ${escape(p.projectName)} » :`,
    contentHtml: blockquote(p.body),
    button: { label: "Répondre dans l'espace", url: p.url },
  });
}

// ===== Notifications à l'admin =====

export async function emailAdminClientValidated(p: {
  projectName: string; stage: "preprod"|"prod"|"postprod"; clientEmail: string; url: string;
}) {
  const lbl = STAGE_LABELS[p.stage];
  return sendBrandedEmail({
    to: ADMIN_EMAIL(),
    subject: `✅ ${p.projectName} — Étape ${lbl} validée par le client`,
    preheader: `${p.clientEmail} a validé.`,
    title: `Étape <em style="font-style:italic;color:#F15A24;">validée</em>`,
    intro: `Le client ${p.clientEmail} a validé l'étape <b>${lbl}</b> du projet « ${escape(p.projectName)} » le ${new Date().toLocaleDateString("fr-FR")}.`,
    button: { label: "Ouvrir le projet", url: p.url },
  });
}

export async function emailAdminClientRejected(p: {
  projectName: string; stage: "preprod"|"prod"|"postprod"; clientEmail: string; reason: string; url: string;
}) {
  const lbl = STAGE_LABELS[p.stage];
  return sendBrandedEmail({
    to: ADMIN_EMAIL(),
    subject: `⚠️ ${p.projectName} — Modifications demandées sur ${lbl}`,
    preheader: `${p.clientEmail} demande des modifications.`,
    title: `Modifications <em style="font-style:italic;color:#F15A24;">demandées</em>`,
    intro: `Le client ${p.clientEmail} a demandé des modifications sur l'étape <b>${lbl}</b> du projet « ${escape(p.projectName)} » :`,
    contentHtml: blockquote(p.reason),
    button: { label: "Ouvrir le projet", url: p.url },
  });
}

export async function emailAdminClientComment(p: {
  projectName: string; clientEmail: string; body: string; url: string;
}) {
  return sendBrandedEmail({
    to: ADMIN_EMAIL(),
    subject: `💬 ${p.projectName} — Nouveau commentaire client`,
    preheader: `${p.clientEmail} a laissé un message.`,
    title: `Nouveau <em style="font-style:italic;color:#F15A24;">commentaire</em>`,
    intro: `${p.clientEmail} vient d'écrire sur « ${escape(p.projectName)} » :`,
    contentHtml: blockquote(p.body),
    button: { label: "Répondre dans l'admin", url: p.url },
  });
}

function blockquote(body: string) {
  return `<div style="margin:8px 0 0;padding:16px 20px;border-left:3px solid #F15A24;background:rgba(241,90,36,0.08);border-radius:4px;font-size:14px;line-height:1.55;color:#fff;white-space:pre-wrap;">${escape(body)}</div>`;
}

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export { SITE, ADMIN_EMAIL, STAGE_LABELS };
