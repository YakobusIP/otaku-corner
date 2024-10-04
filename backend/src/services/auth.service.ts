import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";

export class AuthService {
  async verifyPin(pin1: string, pin2: string) {
    const storedPins = await prisma.adminPin.findFirst();

    if (!storedPins) {
      throw new Error("Pins not found");
    }

    const isPin1Valid = await bcrypt.compare(pin1, storedPins.pin1);
    const isPin2Valid = await bcrypt.compare(pin2, storedPins.pin2);

    return isPin1Valid && isPin2Valid;
  }
}
