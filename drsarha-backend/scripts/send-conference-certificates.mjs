#!/usr/bin/env node

import { readFile, writeFile } from "fs/promises";
import { basename, dirname, resolve } from "path";

const EMAIL_SUBJECT = "Ваш корректный сертификат — приносим извинения за путаницу";
const EMAIL_BODY = `Здравствуйте!

Приносим свои извинения — в предыдущем письме мы по ошибке отправили некорректный сертификат. Во вложении к этому письму вы найдёте правильную, исправленную версию. Пожалуйста, используйте именно её, а предыдущий файл можно удалить.

Спасибо за ваше понимание и терпение — нам очень жаль, что так получилось.

Будем искренне рады, если вы поделитесь сертификатом в своих соцсетях и отметите нас — для нас это очень ценно.

Если возникнут вопросы — просто ответьте на это письмо, мы всегда на связи.

С уважением, Доктор Сара`;

const SEND_RATE_PER_MINUTE = 50;
const DELAY_MS = Math.ceil(60000 / SEND_RATE_PER_MINUTE);
const MAX_RETRIES = 2;
const DEFAULT_UNISENDER_LIST_ID = "72";
const DEFAULT_CERTIFICATES_BASE_URL = "https://storage.yandexcloud.net/drsarha/certificates";

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

function normalizeEmail(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function buildCertificateUrl(baseUrl, fileName) {
  const safeBaseUrl = String(baseUrl || "").replace(/\/+$/, "");
  return `${safeBaseUrl}/${encodeURIComponent(fileName)}`;
}

function parseArgs(argv) {
  const options = {
    manifestPath: undefined,
    dryRun: false,
    limit: undefined,
    offset: 0,
    onlyFailedFrom: undefined,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--manifest") {
      options.manifestPath = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--limit") {
      options.limit = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg === "--offset") {
      options.offset = Number(argv[i + 1]);
      i += 1;
      continue;
    }
    if (arg === "--only-failed-from") {
      options.onlyFailedFrom = argv[i + 1];
      i += 1;
      continue;
    }
  }

  return options;
}

async function resolveManifestPath(manifestPathArg) {
  if (manifestPathArg) {
    return resolve(process.cwd(), manifestPathArg);
  }
  throw new Error("Укажите путь до манифеста через --manifest");
}

async function loadManifestEntries(manifestPath) {
  const raw = await readFile(manifestPath, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error("manifest.json должен быть массивом");
  }
  return parsed;
}

async function loadOnlyFailedEmails(resultsPath) {
  const absolute = resolve(process.cwd(), resultsPath);
  const raw = await readFile(absolute, "utf8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed?.items)) {
    throw new Error("Файл results должен содержать поле items[]");
  }
  return new Set(
    parsed.items
      .filter((item) => item?.status === "failed")
      .map((item) => normalizeEmail(item?.email))
      .filter((email) => email.includes("@"))
  );
}

function resolveCertificatePath(filePathRelative, manifestDir) {
  const candidates = [
    resolve(process.cwd(), filePathRelative),
    resolve(manifestDir, filePathRelative),
  ];

  for (const candidate of candidates) {
    if (candidate && candidate.length > 0) {
      return candidate;
    }
  }
  return resolve(process.cwd(), filePathRelative);
}

async function sendEmailWithAttachment({
  uniSenderApiKey,
  senderEmail,
  listId,
  recipientEmail,
  body,
}) {
  const form = new FormData();
  form.set("format", "json");
  form.set("api_key", uniSenderApiKey);
  form.set("email", recipientEmail);
  form.set("sender_name", "Dr. Sarha");
  form.set("sender_email", senderEmail);
  form.set("subject", EMAIL_SUBJECT);
  form.set("body", body);
  form.set("list_id", listId);
  form.set("error_checking", "1");

  const response = await fetch("https://api.unisender.com/ru/api/sendEmail", {
    method: "POST",
    body: form,
  });

  const responseText = await response.text();
  let parsedJson;
  try {
    parsedJson = JSON.parse(responseText);
  } catch {
    parsedJson = undefined;
  }

  const hasApiError = Boolean(parsedJson?.error);
  const ok = response.ok && !hasApiError;

  return {
    ok,
    status: response.status,
    responseText,
    parsedJson,
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const manifestPath = await resolveManifestPath(args.manifestPath);
  const manifestDir = dirname(manifestPath);

  const uniSenderApiKey = process.env.UNISENDER_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL;
  const listId = process.env.UNISENDER_CERT_LIST_ID || DEFAULT_UNISENDER_LIST_ID;
  const certificatesBaseUrl =
    process.env.CERTIFICATES_BASE_URL || DEFAULT_CERTIFICATES_BASE_URL;
  if (!uniSenderApiKey || !senderEmail) {
    throw new Error("Нужны переменные окружения UNISENDER_API_KEY и SENDER_EMAIL");
  }

  const entries = await loadManifestEntries(manifestPath);
  const onlyFailedEmails = args.onlyFailedFrom
    ? await loadOnlyFailedEmails(args.onlyFailedFrom)
    : null;

  const normalized = entries
    .map((entry, index) => {
      const email = normalizeEmail(entry?.email);
      const filePathRelative = typeof entry?.file_path === "string" ? entry.file_path : "";
      const filePathAbsolute = resolveCertificatePath(filePathRelative, manifestDir);
      return {
        index,
        email,
        filePathRelative,
        filePathAbsolute,
        fileName: typeof entry?.file_name === "string" ? entry.file_name : basename(filePathAbsolute),
      };
    })
    .filter((entry) => entry.email.includes("@"));

  let filtered = normalized;
  if (onlyFailedEmails) {
    filtered = filtered.filter((entry) => onlyFailedEmails.has(entry.email));
  }
  if (Number.isFinite(args.offset) && args.offset > 0) {
    filtered = filtered.slice(args.offset);
  }
  if (Number.isFinite(args.limit) && args.limit > 0) {
    filtered = filtered.slice(0, args.limit);
  }

  const startedAt = new Date().toISOString();
  const report = {
    startedAt,
    mode: args.dryRun ? "dry-run" : "send",
    subject: EMAIL_SUBJECT,
    requested: entries.length,
    selected: filtered.length,
    listId,
    certificatesBaseUrl,
    ratePerMinute: SEND_RATE_PER_MINUTE,
    delayMs: DELAY_MS,
    items: [],
  };

  console.log("[cert-mailer] start", {
    manifestPath,
    requested: entries.length,
    selected: filtered.length,
    dryRun: args.dryRun,
    delayMs: DELAY_MS,
    listId,
    certificatesBaseUrl,
  });

  for (let i = 0; i < filtered.length; i += 1) {
    const item = filtered[i];
    const progress = `${i + 1}/${filtered.length}`;
    const certificateFileName = item.fileName || basename(item.filePathRelative);
    const certificateUrl = buildCertificateUrl(certificatesBaseUrl, certificateFileName);
    const emailBody = `${EMAIL_BODY}

Скачать сертификат:
${certificateUrl}`;

    if (args.dryRun) {
      const dryItem = {
        email: item.email,
        filePath: item.filePathRelative,
        certificateUrl,
        status: "dry-run",
      };
      report.items.push(dryItem);
      console.log("[cert-mailer] dry-run", { progress, ...dryItem });
      if (i < filtered.length - 1) await sleep(DELAY_MS);
      continue;
    }

    let sent = false;
    let lastError = "Unknown error";
    let responseBody = "";
    let responseStatus = 0;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
      const result = await sendEmailWithAttachment({
        uniSenderApiKey,
        senderEmail,
        listId,
        recipientEmail: item.email,
        body: emailBody,
      });

      responseBody = result.responseText;
      responseStatus = result.status;
      if (result.ok) {
        sent = true;
        break;
      }

      const parsedError = result.parsedJson?.error ? JSON.stringify(result.parsedJson) : result.responseText;
      lastError = `HTTP ${result.status}: ${parsedError}`;

      if (attempt < MAX_RETRIES) {
        await sleep(2000 * (attempt + 1));
      }
    }

    if (sent) {
      const success = {
        email: item.email,
        filePath: item.filePathRelative,
        certificateUrl,
        status: "sent",
        responseStatus,
        responseBody,
      };
      report.items.push(success);
      console.log("[cert-mailer] sent", { progress, email: item.email, responseStatus });
    } else {
      const failure = {
        email: item.email,
        filePath: item.filePathRelative,
        certificateUrl,
        status: "failed",
        responseStatus,
        reason: lastError,
        responseBody,
      };
      report.items.push(failure);
      console.log("[cert-mailer] failed", { progress, email: item.email, reason: lastError });
    }

    if (i < filtered.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  const sent = report.items.filter((item) => item.status === "sent").length;
  const failed = report.items.filter((item) => item.status === "failed").length;
  const dryRun = report.items.filter((item) => item.status === "dry-run").length;
  report.finishedAt = new Date().toISOString();
  report.summary = {
    sent,
    failed,
    dryRun,
    totalProcessed: report.items.length,
  };

  const reportName = `send-results-${Date.now()}.json`;
  const reportPath = resolve(manifestDir, reportName);
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log("[cert-mailer] done", {
    sent,
    failed,
    dryRun,
    reportPath,
  });
}

main().catch((error) => {
  console.error("[cert-mailer] fatal", error instanceof Error ? error.message : error);
  process.exit(1);
});
