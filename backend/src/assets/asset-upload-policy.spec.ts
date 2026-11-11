import {
  ALLOWED_IMAGE_ASSET_MIMES,
  assetDeclaredImageMimeMatchesHead,
  fileExtensionForNormalizedImageMime,
  normalizeContentTypeHeader,
  normalizeDeclaredImageMimeType
} from "./asset-upload-policy";

const expectNullForUnusableRaw = (
  normalize: (raw: string | undefined) => string | null
): void => {
  expect(normalize(undefined)).toBeNull();
  expect(normalize(42 as unknown as string)).toBeNull();
  expect(normalize("")).toBeNull();
  expect(normalize("   ")).toBeNull();
};

describe("asset-upload-policy", () => {
  describe("ALLOWED_IMAGE_ASSET_MIMES", () => {
    it("contains the four normalized image mime types", () => {
      expect([...ALLOWED_IMAGE_ASSET_MIMES].sort()).toEqual([
        "image/gif",
        "image/jpeg",
        "image/png",
        "image/webp"
      ]);
    });
  });

  describe("normalizeDeclaredImageMimeType", () => {
    it("returns null for non-strings and blank input", () => {
      expectNullForUnusableRaw(normalizeDeclaredImageMimeType);
    });

    it("returns null for an unknown mime type", () => {
      expect(normalizeDeclaredImageMimeType("image/bmp")).toBe(null);
      expect(normalizeDeclaredImageMimeType("application/octet-stream")).toBe(
        null
      );
    });

    it.each([
      ["image/jpeg", "image/jpeg"],
      ["image/jpg", "image/jpeg"],
      ["image/pjpeg", "image/jpeg"],
      ["IMAGE/JPG", "image/jpeg"],
      ["  image/jpeg  ", "image/jpeg"],
      ["image/jpeg; charset=binary", "image/jpeg"]
    ])("maps jpeg aliases %p to %p", (raw, expected) => {
      expect(normalizeDeclaredImageMimeType(raw)).toBe(expected);
    });

    it.each([
      ["image/png", "image/png"],
      ["image/gif", "image/gif"],
      ["image/webp", "image/webp"],
      ["Image/PNG; foo=bar", "image/png"]
    ])("accepts supported image types %p as %p", (raw, expected) => {
      expect(normalizeDeclaredImageMimeType(raw)).toBe(expected);
    });
  });

  describe("fileExtensionForNormalizedImageMime", () => {
    it.each([
      [".jpg", "image/jpeg"],
      [".png", "image/png"],
      [".gif", "image/gif"],
      [".webp", "image/webp"]
    ])("returns %p for normalized mime %p", (extension, mime) => {
      expect(fileExtensionForNormalizedImageMime(mime)).toBe(extension);
    });

    it("returns null when normalized mime has no mapped extension", () => {
      expect(fileExtensionForNormalizedImageMime("image/bmp")).toBe(null);
      expect(fileExtensionForNormalizedImageMime("image/jpg")).toBe(null);
    });
  });

  describe("normalizeContentTypeHeader", () => {
    it("returns null for non-strings and blank input", () => {
      expectNullForUnusableRaw(normalizeContentTypeHeader);
    });

    it("trims, lowercases, and strips parameters after a semicolon", () => {
      expect(normalizeContentTypeHeader("  Image/PNG; charset=utf-8  ")).toBe(
        "image/png"
      );
      expect(normalizeContentTypeHeader("image/jpeg")).toBe("image/jpeg");
    });

    it("preserves non-canonical jpeg header tokens without remapping", () => {
      expect(normalizeContentTypeHeader("image/jpg")).toBe("image/jpg");
      expect(normalizeContentTypeHeader("image/pjpeg")).toBe("image/pjpeg");
    });
  });

  describe("assetDeclaredImageMimeMatchesHead", () => {
    it("returns true when head content-type is missing or blank", () => {
      expect(assetDeclaredImageMimeMatchesHead(undefined, "image/png")).toBe(
        true
      );
      expect(assetDeclaredImageMimeMatchesHead("   ", "image/png")).toBe(true);
    });

    it("returns false when head is present but declared mime is not a known image type", () => {
      expect(assetDeclaredImageMimeMatchesHead("image/png", "image/bmp")).toBe(
        false
      );
    });

    it("returns true when normalized head and declared mime are equal", () => {
      expect(assetDeclaredImageMimeMatchesHead("image/png", "Image/PNG")).toBe(
        true
      );
      expect(
        assetDeclaredImageMimeMatchesHead(
          "image/jpeg; charset=binary",
          "image/jpeg"
        )
      ).toBe(true);
    });

    it.each([["image/jpg"], ["image/pjpeg"], ["IMAGE/PJPEG"]])(
      "returns true when declared mime is a jpeg alias and head is alias %p",
      (head) => {
        expect(assetDeclaredImageMimeMatchesHead(head, "image/jpeg")).toBe(
          true
        );
        expect(assetDeclaredImageMimeMatchesHead(head, "image/jpg")).toBe(true);
      }
    );

    it("returns false when head and declared mime disagree and jpeg alias rule does not apply", () => {
      expect(assetDeclaredImageMimeMatchesHead("image/png", "image/jpeg")).toBe(
        false
      );
      expect(assetDeclaredImageMimeMatchesHead("image/gif", "image/webp")).toBe(
        false
      );
    });
  });
});
