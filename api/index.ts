import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createExpressApp } from "../server/_core/index";

let cachedApp: any = null;

export default async (req: VercelRequest, res: VercelResponse) => {
  // Cache the Express app to avoid recreating it on every request
  if (!cachedApp) {
    cachedApp = await createExpressApp();
  }
  return cachedApp(req, res);
};
