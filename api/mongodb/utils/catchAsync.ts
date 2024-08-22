import { NextApiRequest } from "next";

export default (fn: any) => {
  return async (req: Request, res: Response, next: NextApiRequest) => {
    fn(req, res, next).catch(next);
  };
};
