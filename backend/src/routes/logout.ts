import type { Request, Response } from "express";
import { ACCESS_TOKEN_NAME } from "../utils/access-token";

export const logout = async (req: Request, res: Response) => {
  res.clearCookie(ACCESS_TOKEN_NAME);
  res.status(200);
  res.end();
};
