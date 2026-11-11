import { BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { loggedAxiosRequest } from "@/common/logging/http-client-logging";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { TenraiProxyService } from "./tenrai-proxy.service";

jest.mock("@/common/logging/http-client-logging", () => ({
  loggedAxiosRequest: jest.fn()
}));

const mockLoggedAxiosRequest = loggedAxiosRequest as jest.MockedFunction<
  typeof loggedAxiosRequest
>;

describe("TenraiProxyService", () => {
  const baseUrl = "https://tenrai.example";

  const createService = () => {
    const config = {
      getOrThrow: jest.fn().mockReturnValue(baseUrl)
    };
    const service = new TenraiProxyService(
      config as unknown as ConfigService,
      {} as StructuredLogger
    );
    return { service, config };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLoggedAxiosRequest.mockResolvedValue({
      data: { proxied: true }
    } as never);
  });

  describe("forwardGet", () => {
    it("prefixes a leading slash when the path omits one", async () => {
      const { service } = createService();

      await service.forwardGet("anime/42");

      expect(mockLoggedAxiosRequest).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: "GET",
          provider: "tenrai",
          endpoint: "tenrai.proxy/anime/42"
        }),
        {
          method: "GET",
          url: `${baseUrl}/anime/42`,
          params: {}
        }
      );
    });

    it("allows /anime and nested anime paths", async () => {
      const { service } = createService();

      await service.forwardGet("/anime");
      await service.forwardGet("/anime/catalog/1/episodes");

      expect(mockLoggedAxiosRequest).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.objectContaining({ endpoint: "tenrai.proxy/anime" }),
        expect.objectContaining({ url: `${baseUrl}/anime` })
      );
      expect(mockLoggedAxiosRequest).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.objectContaining({
          endpoint: "tenrai.proxy/anime/catalog/1/episodes"
        }),
        expect.objectContaining({
          url: `${baseUrl}/anime/catalog/1/episodes`
        })
      );
    });

    it("allows /manga and nested manga paths", async () => {
      const { service } = createService();

      await service.forwardGet("/manga");
      await service.forwardGet("manga/search/by-title");

      expect(mockLoggedAxiosRequest).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.objectContaining({ endpoint: "tenrai.proxy/manga" }),
        expect.objectContaining({ url: `${baseUrl}/manga` })
      );
      expect(mockLoggedAxiosRequest).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.objectContaining({
          endpoint: "tenrai.proxy/manga/search/by-title"
        }),
        expect.objectContaining({
          url: `${baseUrl}/manga/search/by-title`
        })
      );
    });

    it("issues a GET via loggedAxiosRequest with base URL, path, and query params", async () => {
      const { service, config } = createService();
      const query = { q: "naruto", page: 2 };

      const result = await service.forwardGet("/anime/search", query);

      expect(config.getOrThrow).toHaveBeenCalledWith("TENRAI_BASE_URL");
      expect(mockLoggedAxiosRequest).toHaveBeenCalledTimes(1);
      expect(mockLoggedAxiosRequest).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          provider: "tenrai",
          method: "GET",
          endpoint: "tenrai.proxy/anime/search"
        }),
        {
          method: "GET",
          url: `${baseUrl}/anime/search`,
          params: query
        }
      );
      expect(result).toEqual({ proxied: true });
    });

    it.each(["", "/", "/light-novel", "/anim", "/mang"])(
      "rejects invalid path %p with BadRequestException and does not call axios",
      async (path) => {
        const { service } = createService();

        await expect(service.forwardGet(path)).rejects.toThrow(
          new BadRequestException("Invalid Tenrai proxy path")
        );
        expect(mockLoggedAxiosRequest).not.toHaveBeenCalled();
      }
    );
  });
});
