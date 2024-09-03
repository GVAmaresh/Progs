// import { NextApiRequest } from "next";

// import { NextApiRequest, NextApiResponse } from "next";
// import AppError from "./appError";

import { Request, Response, NextFunction } from 'express';

const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;



// export default (fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => 
//   async (req: NextApiRequest, res: NextApiResponse) => {
//     try {
//       await fn(req, res);
//     } catch (err) {
//       res.status((err as AppError).statusCode || 500).json({
//         status: 'fail',
//         message: (err as AppError).message || 'An error occurred'
//       });
//     }
//   };