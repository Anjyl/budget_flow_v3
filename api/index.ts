import { createExpressApp } from "../server/_core/index";

export default async (req: any, res: any) => {
  const app = await createExpressApp();
  return app(req, res);
};
