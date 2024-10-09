import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  UnauthorizedError
} from "../lib/error";

const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET || "access_token_secret";
const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET || "refresh_token_secret";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pin1, pin2 } = req.body;

      if (!pin1 || !pin2) {
        throw new BadRequestError("Invalid request body!");
      }

      if (await this.authService.verifyPin(pin1, pin2)) {
        const accessToken = jwt.sign({ role: "admin" }, ACCESS_TOKEN_SECRET, {
          expiresIn: "15m"
        });

        const refreshToken = jwt.sign({ role: "admin" }, REFRESH_TOKEN_SECRET, {
          expiresIn: "7d"
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "strict"
        });

        res.status(200).json({ accessToken });
      } else {
        throw new UnauthorizedError("Invalid pins!");
      }
    } catch (error) {
      if (
        error instanceof BadRequestError ||
        error instanceof UnauthorizedError ||
        error instanceof InternalServerError
      ) {
        return next(error);
      }

      return next(new InternalServerError((error as Error).message));
    }
  };

  logout = async (_: Request, res: Response) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    });
    return res.status(200).json({ message: "Logged out successfully!" });
  };

  validateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers["authorization"];

      if (!authHeader) {
        throw new UnauthorizedError("Access denied. No token provided!");
      }

      const token = authHeader.split(" ")[1];

      if (!token) throw new UnauthorizedError("Invalid token!");

      jwt.verify(token, ACCESS_TOKEN_SECRET, (err, _) => {
        if (err) {
          return res.status(401).json({ error: "Invalid token!" });
        }

        return res.status(200).end();
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) throw new ForbiddenError("Session timed out!");

      jwt.verify(refreshToken as string, REFRESH_TOKEN_SECRET, (err, _) => {
        if (err) return next(new ForbiddenError("Invalid token!"));

        const accessToken = jwt.sign({ role: "admin" }, ACCESS_TOKEN_SECRET, {
          expiresIn: "15m"
        });

        return res.status(200).json({ accessToken });
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        return next(error);
      }
      return next(new InternalServerError((error as Error).message));
    }
  };
}
