import { v4 as uuidv4 } from "uuid";
import path from "path";

export const generateFilename = (originalName: string) => {
  const extension = path.extname(originalName).toLowerCase();
  const uuid = uuidv4();
  return [uuid, `${uuid}${extension}`];
};
