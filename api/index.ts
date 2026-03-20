import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createExpressApp } from "../server/_core/index";

export default async (req: VercelRequest, res: VercelResponse) => {
  const app = await createExpressApp();
  return app(req, res);
};
