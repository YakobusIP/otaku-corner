import { BadRequestException, Injectable } from "@nestjs/common";

import { PrismaService } from "@/prisma/prisma.service";

import { Prisma } from "@prisma/client";

@Injectable()
export class StatisticDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private cutoffForDashboardYear(year: number, now: Date): Date {
    if (year > now.getUTCFullYear()) {
      throw new BadRequestException("Year cannot be in the future");
    }
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    if (year < now.getUTCFullYear()) {
      return endOfYear;
    }
    return now.getTime() < endOfYear.getTime() ? now : endOfYear;
  }

  private shiftUtcYears(date: Date, deltaYears: number): Date {
    const copy = new Date(date.getTime());
    copy.setUTCFullYear(copy.getUTCFullYear() + deltaYears);
    return copy;
  }

  private async totalMediaAt(cutoff: Date): Promise<number> {
    const [anime, manga, lightNovel] = await Promise.all([
      this.prisma.anime.count({ where: { createdAt: { lte: cutoff } } }),
      this.prisma.manga.count({ where: { createdAt: { lte: cutoff } } }),
      this.prisma.lightNovel.count({ where: { createdAt: { lte: cutoff } } })
    ]);
    return anime + manga + lightNovel;
  }

  private async inProgressSnapshotAt(cutoff: Date): Promise<number> {
    const [animeC, mangaC, lnC] = await Promise.all([
      this.prisma.$queryRaw<[{ c: bigint }]>(Prisma.sql`
        SELECT COUNT(*)::bigint AS c FROM "AnimeReview" r
        WHERE (
          (r."progressStatus" = 'ON_PROGRESS' AND r."updatedAt" <= ${cutoff})
          OR (r."progressStatus" = 'COMPLETED' AND r."updatedAt" > ${cutoff})
        )
      `),
      this.prisma.$queryRaw<[{ c: bigint }]>(Prisma.sql`
        SELECT COUNT(*)::bigint AS c FROM "MangaReview" r
        WHERE (
          (r."progressStatus" = 'ON_PROGRESS' AND r."updatedAt" <= ${cutoff})
          OR (r."progressStatus" = 'COMPLETED' AND r."updatedAt" > ${cutoff})
        )
      `),
      this.prisma.$queryRaw<[{ c: bigint }]>(Prisma.sql`
        SELECT COUNT(*)::bigint AS c FROM "LightNovelReview" r
        WHERE (
          (r."progressStatus" = 'ON_PROGRESS' AND r."updatedAt" <= ${cutoff})
          OR (r."progressStatus" = 'COMPLETED' AND r."updatedAt" > ${cutoff})
        )
      `)
    ]);
    return (
      Number(animeC[0]?.c ?? 0n) +
      Number(mangaC[0]?.c ?? 0n) +
      Number(lnC[0]?.c ?? 0n)
    );
  }

  private async averagePersonalSnapshotAt(cutoff: Date): Promise<number> {
    const [a, m, ln] = await Promise.all([
      this.prisma.animeReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _sum: { personalScore: true },
        _count: { id: true }
      }),
      this.prisma.mangaReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _sum: { personalScore: true },
        _count: { id: true }
      }),
      this.prisma.lightNovelReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _sum: { personalScore: true },
        _count: { id: true }
      })
    ]);
    const sum =
      (a._sum.personalScore ?? 0) +
      (m._sum.personalScore ?? 0) +
      (ln._sum.personalScore ?? 0);
    const n = a._count.id + m._count.id + ln._count.id;
    return n === 0 ? 0 : Math.round((sum / n) * 100) / 100;
  }

  private async maxPersonalSnapshotAt(cutoff: Date): Promise<number> {
    const [a, m, ln] = await Promise.all([
      this.prisma.animeReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _max: { personalScore: true }
      }),
      this.prisma.mangaReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _max: { personalScore: true }
      }),
      this.prisma.lightNovelReview.aggregate({
        where: { personalScore: { not: null }, createdAt: { lte: cutoff } },
        _max: { personalScore: true }
      })
    ]);
    return Math.max(
      a._max.personalScore ?? 0,
      m._max.personalScore ?? 0,
      ln._max.personalScore ?? 0
    );
  }

  private buildKpiMetric(current: number, previous: number) {
    const changeAbsolute = Math.round((current - previous) * 100) / 100;
    const changePercent =
      previous === 0
        ? current === 0
          ? 0
          : 100
        : Math.round(((current - previous) / previous) * 1000) / 10;
    return {
      value: current,
      previousValue: previous,
      changePercent,
      changeAbsolute
    };
  }

  async getDashboardKpis(year: number) {
    const now = new Date();
    const cutoff = this.cutoffForDashboardYear(year, now);
    const priorCutoff = this.shiftUtcYears(cutoff, -1);

    const [
      totalMediaNow,
      totalMediaPrev,
      inProgressNow,
      inProgressPrev,
      avgNow,
      avgPrev,
      topNow,
      topPrev
    ] = await Promise.all([
      this.totalMediaAt(cutoff),
      this.totalMediaAt(priorCutoff),
      this.inProgressSnapshotAt(cutoff),
      this.inProgressSnapshotAt(priorCutoff),
      this.averagePersonalSnapshotAt(cutoff),
      this.averagePersonalSnapshotAt(priorCutoff),
      this.maxPersonalSnapshotAt(cutoff),
      this.maxPersonalSnapshotAt(priorCutoff)
    ]);

    return {
      year,
      cutoffAt: cutoff.toISOString(),
      priorCutoffAt: priorCutoff.toISOString(),
      totalMedia: this.buildKpiMetric(totalMediaNow, totalMediaPrev),
      inProgress: this.buildKpiMetric(inProgressNow, inProgressPrev),
      averagePersonalScore: this.buildKpiMetric(avgNow, avgPrev),
      topRatedPersonalScore: this.buildKpiMetric(topNow, topPrev)
    };
  }

  async getDashboardKpisAllTime() {
    const now = new Date();
    const [totalMediaNow, inProgressNow, avgNow, topNow] = await Promise.all([
      this.totalMediaAt(now),
      this.inProgressSnapshotAt(now),
      this.averagePersonalSnapshotAt(now),
      this.maxPersonalSnapshotAt(now)
    ]);

    return {
      year: null,
      cutoffAt: now.toISOString(),
      priorCutoffAt: now.toISOString(),
      totalMedia: this.buildKpiMetric(totalMediaNow, totalMediaNow),
      inProgress: this.buildKpiMetric(inProgressNow, inProgressNow),
      averagePersonalScore: this.buildKpiMetric(avgNow, avgNow),
      topRatedPersonalScore: this.buildKpiMetric(topNow, topNow)
    };
  }
}
