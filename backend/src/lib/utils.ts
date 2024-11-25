import { v4 as uuidv4 } from "uuid";
import path from "path";

export const generateFilename = (originalName: string) => {
  const extension = path.extname(originalName).toLowerCase();
  const uuid = uuidv4();
  return [uuid, `${uuid}${extension}`];
};

export const chunkArray = <T>(array: T[], chunkSize: number) => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};
