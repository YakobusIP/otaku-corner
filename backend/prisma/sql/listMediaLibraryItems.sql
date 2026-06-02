-- @param {String} $1:status?
-- @param {Float} $2:malScoreMin?
-- @param {Float} $3:malScoreMax?
-- @param {Float} $4:personalScoreMin?
-- @param {Float} $5:personalScoreMax?
-- @param {String} $6:statusCheck?
-- @param {String} $7:sort
-- @param {String} $8:sortOrder
-- @param {Int} $9:limit
-- @param {Int} $10:offset
-- @param {Int} $11:genreId?
-- @param {Int} $12:studioId?
-- @param {Int} $13:themeId?
-- @param {Int} $14:authorId?
-- @param {String} $15:type?
-- @param {String} $16:searchQuery?
WITH combined AS (
  SELECT
    'anime'::text AS "mediaType",
    a.id,
    a.slug,
    a.title,
    a."titleJapanese",
    a.images,
    a.status,
    a.type,
    a.score,
    a.season,
    a.aired,
    a.rating,
    NULL::integer AS "chaptersCount",
    NULL::integer AS "volumesCount",
    ar."reviewText",
    ar."progressStatus"::text AS "progressStatus",
    ar."personalScore",
    ar."consumedAt",
    (
      SELECT COUNT(*)::integer
      FROM "AnimeEpisode" ae
      WHERE ae."animeId" = a.id
    ) AS "fetchedEpisode",
    '[]'::jsonb AS "volumeProgress"
  FROM "Anime" a
  LEFT JOIN "AnimeReview" ar ON ar."animeId" = a.id
  WHERE
    ($1::text IS NULL OR ar."progressStatus"::text = $1)
    AND ($2::double precision IS NULL OR a.score >= $2)
    AND ($3::double precision IS NULL OR a.score <= $3)
    AND ($4::double precision IS NULL OR ar."personalScore" >= $4)
    AND ($5::double precision IS NULL OR ar."personalScore" <= $5)
    AND (
      $6::text IS NULL
      OR $6 NOT IN ('complete', 'incomplete')
      OR (
        $6 = 'complete'
        AND (
          a.type IN ('Movie', 'OVA')
          OR EXISTS (
            SELECT 1
            FROM "AnimeEpisode" ae
            WHERE ae."animeId" = a.id
          )
        )
        AND ar."reviewText" IS NOT NULL
        AND ar."consumedAt" IS NOT NULL
      )
      OR (
        $6 = 'incomplete'
        AND (
          (
            a.type NOT IN ('Movie', 'OVA')
            AND NOT EXISTS (
              SELECT 1
              FROM "AnimeEpisode" ae
              WHERE ae."animeId" = a.id
            )
          )
          OR ar."reviewText" IS NULL
          OR ar."consumedAt" IS NULL
        )
      )
    )
    AND (
      $11::int IS NULL
      OR EXISTS (
        SELECT 1
        FROM "AnimeGenres" ag
        WHERE ag."animeId" = a.id
          AND ag."genreId" = $11
      )
    )
    AND (
      $12::int IS NULL
      OR EXISTS (
        SELECT 1
        FROM "AnimeStudios" ast
        WHERE ast."animeId" = a.id
          AND ast."studioId" = $12
      )
    )
    AND (
      $13::int IS NULL
      OR EXISTS (
        SELECT 1
        FROM "AnimeThemes" ath
        WHERE ath."animeId" = a.id
          AND ath."themeId" = $13
      )
    )
    AND ($14::int IS NULL)
    AND ($15::text IS NULL OR a.type = $15)
    AND (
      $16::text IS NULL
      OR length(trim($16::text)) = 0
      OR (
        a.title ILIKE ('%' || trim($16::text) || '%')
        OR a."titleSynonyms" ILIKE ('%' || trim($16::text) || '%')
      )
    )

  UNION ALL

  SELECT
    'manga'::text AS "mediaType",
    m.id,
    m.slug,
    m.title,
    m."titleJapanese",
    m.images,
    m.status,
    NULL::text AS type,
    m.score,
    NULL::text AS season,
    NULL::text AS aired,
    NULL::text AS rating,
    m."chaptersCount",
    m."volumesCount",
    mr."reviewText",
    mr."progressStatus"::text AS "progressStatus",
    mr."personalScore",
    mr."consumedAt",
    NULL::integer AS "fetchedEpisode",
    '[]'::jsonb AS "volumeProgress"
  FROM "Manga" m
  LEFT JOIN "MangaReview" mr ON mr."mangaId" = m.id
  WHERE
    ($1::text IS NULL OR mr."progressStatus"::text = $1)
    AND ($2::double precision IS NULL OR m.score >= $2)
    AND ($3::double precision IS NULL OR m.score <= $3)
    AND ($4::double precision IS NULL OR mr."personalScore" >= $4)
    AND ($5::double precision IS NULL OR mr."personalScore" <= $5)
    AND (
      $6::text IS NULL
      OR $6 NOT IN ('complete', 'incomplete')
      OR (
        $6 = 'complete'
        AND m."chaptersCount" IS NOT NULL
        AND m."volumesCount" IS NOT NULL
        AND mr."reviewText" IS NOT NULL
        AND mr."consumedAt" IS NOT NULL
      )
      OR (
        $6 = 'incomplete'
        AND (
          m."chaptersCount" IS NULL
          OR m."volumesCount" IS NULL
          OR mr."reviewText" IS NULL
          OR mr."consumedAt" IS NULL
        )
      )
    )
    AND (
      $11::int IS NULL
      OR EXISTS (
        SELECT 1
        FROM "MangaGenres" mg
        WHERE mg."mangaId" = m.id
          AND mg."genreId" = $11
      )
    )
    AND ($12::int IS NULL)
    AND (
      $13::int IS NULL
      OR EXISTS (
        SELECT 1
        FROM "MangaThemes" mt
        WHERE mt."mangaId" = m.id
          AND mt."themeId" = $13
      )
    )
    AND (
      $14::int IS NULL
      OR EXISTS (
        SELECT 1
        FROM "MangaAuthors" ma
        WHERE ma."mangaId" = m.id
          AND ma."authorId" = $14
      )
    )
    AND ($15::text IS NULL)
    AND (
      $16::text IS NULL
      OR length(trim($16::text)) = 0
      OR (
        m.title ILIKE ('%' || trim($16::text) || '%')
        OR m."titleSynonyms" ILIKE ('%' || trim($16::text) || '%')
      )
    )

  UNION ALL

  SELECT
    'lightNovel'::text AS "mediaType",
    ln.id,
    ln.slug,
    ln.title,
    ln."titleJapanese",
    ln.images,
    ln.status,
    NULL::text AS type,
    ln.score,
    NULL::text AS season,
    NULL::text AS aired,
    NULL::text AS rating,
    NULL::integer AS "chaptersCount",
    ln."volumesCount",
    lnr."reviewText",
    lnr."progressStatus"::text AS "progressStatus",
    lnr."personalScore",
    NULL::date AS "consumedAt",
    NULL::integer AS "fetchedEpisode",
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'volumeNumber',
            lnv."volumeNumber",
            'consumedAt',
            lnv."consumedAt"
          )
          ORDER BY lnv."volumeNumber" ASC
        )
        FROM "LightNovelVolumes" lnv
        WHERE lnv."lightNovelId" = ln.id
      ),
      '[]'::jsonb
    ) AS "volumeProgress"
  FROM "LightNovel" ln
  LEFT JOIN "LightNovelReview" lnr ON lnr."lightNovelId" = ln.id
  WHERE
    ($1::text IS NULL OR lnr."progressStatus"::text = $1)
    AND ($2::double precision IS NULL OR ln.score >= $2)
    AND ($3::double precision IS NULL OR ln.score <= $3)
    AND ($4::double precision IS NULL OR lnr."personalScore" >= $4)
    AND ($5::double precision IS NULL OR lnr."personalScore" <= $5)
    AND (
      $6::text IS NULL
      OR $6 NOT IN ('complete', 'incomplete')
      OR (
        $6 = 'complete'
        AND ln."volumesCount" IS NOT NULL
        AND lnr."reviewText" IS NOT NULL
        AND lnr."progressStatus"::text <> 'DROPPED'
        AND NOT EXISTS (
          SELECT 1
          FROM "LightNovelVolumes" lnv
          WHERE lnv."lightNovelId" = ln.id
            AND lnv."consumedAt" IS NULL
        )
      )
      OR (
        $6 = 'incomplete'
        AND (
          ln."volumesCount" IS NULL
          OR lnr."reviewText" IS NULL
          OR lnr."progressStatus"::text = 'DROPPED'
          OR EXISTS (
            SELECT 1
            FROM "LightNovelVolumes" lnv
            WHERE lnv."lightNovelId" = ln.id
              AND lnv."consumedAt" IS NULL
          )
        )
      )
    )
    AND (
      $11::int IS NULL
      OR EXISTS (
        SELECT 1
        FROM "LightNovelGenres" lng
        WHERE lng."lightNovelId" = ln.id
          AND lng."genreId" = $11
      )
    )
    AND ($12::int IS NULL)
    AND (
      $13::int IS NULL
      OR EXISTS (
        SELECT 1
        FROM "LightNovelThemes" lnt
        WHERE lnt."lightNovelId" = ln.id
          AND lnt."themeId" = $13
      )
    )
    AND (
      $14::int IS NULL
      OR EXISTS (
        SELECT 1
        FROM "LightNovelAuthors" lna
        WHERE lna."lightNovelId" = ln.id
          AND lna."authorId" = $14
      )
    )
    AND ($15::text IS NULL)
    AND (
      $16::text IS NULL
      OR length(trim($16::text)) = 0
      OR (
        ln.title ILIKE ('%' || trim($16::text) || '%')
        OR ln."titleSynonyms" ILIKE ('%' || trim($16::text) || '%')
      )
    )
)
SELECT
  *,
  COUNT(*) OVER()::integer AS "totalCount"
FROM combined
ORDER BY
  CASE WHEN $7 = 'score' AND $8 = 'asc' THEN score END ASC NULLS LAST,
  CASE WHEN $7 = 'score' AND $8 = 'desc' THEN score END DESC NULLS LAST,
  CASE WHEN $7 = 'personal_score' AND $8 = 'asc' THEN "personalScore" END ASC NULLS LAST,
  CASE WHEN $7 = 'personal_score' AND $8 = 'desc' THEN "personalScore" END DESC NULLS LAST,
  CASE WHEN $7 NOT IN ('score', 'personal_score') AND $8 = 'desc' THEN lower(title) END DESC,
  CASE WHEN ($7 IN ('score', 'personal_score') OR $8 <> 'desc') THEN lower(title) END ASC,
  lower(title) ASC,
  "mediaType" ASC,
  id ASC
LIMIT $9 OFFSET $10
