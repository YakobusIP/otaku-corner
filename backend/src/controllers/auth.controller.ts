import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

const ACCESS_TOKEN_SECRET = env.ACCESS_TOKEN_SECRET || "access_token_secret";
const REFRESH_TOKEN_SECRET = env.REFRESH_TOKEN_SECRET || "refresh_token_secret";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { pin1, pin2 } = req.body;

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
        res.status(401).json({ error: "Invalid pins!" });
      }
    } catch (error) {
      res.status(500).json({ error });
    }
  };

  logout = async (_: Request, res: Response): Promise<void> => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict"
    });
    res.status(200).json({ message: "Logged out successfully!" });
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) res.status(403).json({ error: "Session timed out!" });

    jwt.verify(refreshToken as string, REFRESH_TOKEN_SECRET, (err, _) => {
      if (err) return res.status(403).json({ error: "Invalid token!" });

      const accessToken = jwt.sign({ role: "admin" }, ACCESS_TOKEN_SECRET, {
        expiresIn: "15m"
      });

      res.status(200).json({ accessToken });
    });
  };
}
