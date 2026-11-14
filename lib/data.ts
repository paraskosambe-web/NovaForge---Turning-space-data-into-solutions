import rawDataset from "@/data/normalized/investigations.json";
import { InvestigationDatasetSchema } from "@/lib/schema";

// Parsing at module load intentionally makes any missing value type/source a build error.
export const dataset = InvestigationDatasetSchema.parse(rawDataset);
export const investigations = dataset.investigations;

export function findInvestigation(id: string) {
  return investigations.find((item) => item.id.toLowerCase() === id.toLowerCase());
}

export function getDownloadRecords() {
  return investigations;
}
