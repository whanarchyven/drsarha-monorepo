const fs = require("node:fs/promises");
const path = require("node:path");

const BASE_URL = "https://enduring-goldfish-158.convex.site/pins/summary";
const BATCH_SIZE = 10;
const INPUT_FILE = path.join(__dirname, "pins.txt");
const OUTPUT_FILE = path.join(__dirname, "pin-summaries-output.json");

function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function readPinIds() {
  const raw = await fs.readFile(INPUT_FILE, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

async function fetchBatch(pinIds, batchIndex, batchCount) {
  const url = new URL(BASE_URL);
  url.searchParams.set("pinIds", pinIds.join(","));

  console.log(
    `[${batchIndex}/${batchCount}] Fetching ${pinIds.length} pin summaries`
  );

  const response = await fetch(url);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(
      `Request failed with ${response.status}: ${text || response.statusText}`
    );
  }

  const json = JSON.parse(text);
  return Array.isArray(json) ? json : [json];
}

async function main() {
  const pinIds = await readPinIds();
  const batches = chunk(pinIds, BATCH_SIZE);
  const items = [];
  const failedBatches = [];

  console.log(`Found ${pinIds.length} pin ids`);
  console.log(`Processing ${batches.length} batches of up to ${BATCH_SIZE}`);

  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];

    try {
      const summaries = await fetchBatch(batch, index + 1, batches.length);

      batch.forEach((pinId, offset) => {
        items.push({
          line: index * BATCH_SIZE + offset + 1,
          pinId,
          summary: summaries[offset] ?? null,
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[${index + 1}/${batches.length}] Failed: ${message}`);

      failedBatches.push({
        batch: index + 1,
        pinIds: batch,
        error: message,
      });

      batch.forEach((pinId, offset) => {
        items.push({
          line: index * BATCH_SIZE + offset + 1,
          pinId,
          summary: null,
        });
      });
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    sourceFile: path.relative(__dirname, INPUT_FILE),
    endpoint: BASE_URL,
    batchSize: BATCH_SIZE,
    requestedPins: pinIds.length,
    succeededPins: items.filter((item) => item.summary !== null).length,
    failedPins: items.filter((item) => item.summary === null).length,
    failedBatches,
    items,
  };

  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  console.log(`Saved result to ${OUTPUT_FILE}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
