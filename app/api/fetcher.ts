import { config } from "@/app.config";
import logger from "@/lib/logger";

export const fetcher = {
  get: async <T>(path: string): Promise<T> => {
    logger.debug(`Fetching ${path}`);
    const response = await fetch(`${config.apiBaseUrl}${path}`);
    if (!response.ok) {
      logger.error(`Failed to fetch ${path}`);
      throw new Error(`Failed to fetch ${path}`);
    }
    return response.json();
  },
};
