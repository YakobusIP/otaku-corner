import asyncio
import time
import json
import os
from datetime import datetime
from jikanpy import AioJikan
from rich.console import Console
import random

console = Console()


def read_ids_from_file(file_path):
    with open(file_path, "r") as file:
        return [int(line.strip()) for line in file.readlines()]


def save_payload_to_json(filename, payload):
    os.makedirs("media_cache", exist_ok=True)
    filepath = f"media_cache/{filename}.json"
    with open(filepath, "w") as file:
        json.dump(payload, file, indent=2)
    console.print(f"Payload saved to {filepath}", style="blue")


statuses = ["PLANNED", "ON_HOLD", "ON_PROGRESS", "COMPLETED", "DROPPED"]


def create_anime(anime_data, anime_episodes, embed_url):
    year = random.randint(2020, 2024)
    month = random.randint(1, 12)
    day = 1
    random_date = datetime(year, month, day)
    consumed_at = random_date.strftime("%Y-%m-%dT00:00:00.000Z")

    return {
        "malId": anime_data["mal_id"],
        "type": anime_data["type"],
        "status": anime_data["status"],
        "rating": anime_data.get("rating", "Unrated"),
        "season": f"{anime_data["season"].upper()} {anime_data["year"]}"
        if anime_data["season"]
        else None,
        "title": anime_data["title"],
        "titleJapanese": anime_data["title_japanese"],
        "titleSynonyms": " ".join([synonym.lower() for synonym in anime_data["title_synonyms"]]),
        "source": anime_data["source"],
        "aired": (
            f"{datetime.strptime(anime_data["aired"]["from"], "%Y-%m-%dT%H:%M:%S%z").strftime("%b %d, %Y")} to "
            f"{datetime.strptime(anime_data["aired"]["to"], "%Y-%m-%dT%H:%M:%S%z").strftime("%b %d, %Y") if anime_data["aired"]["to"] else "?"}"
        )
        if anime_data["type"] == "TV" and anime_data["status"] != "Not yet aired"
        else anime_data["status"],
        "broadcast": anime_data.get("broadcast", {}).get("string", "N/A"),
        "episodesCount": anime_data["episodes"],
        "duration": anime_data["duration"],
        "score": anime_data["score"],
        "images": {
            "image_url": anime_data["images"]["webp"]["image_url"]
            if anime_data["images"]["webp"]
            else anime_data["images"]["jpg"]["image_url"],
            "large_image_url": anime_data["images"]["webp"]["large_image_url"]
            if anime_data["images"]["webp"]
            else anime_data["images"]["jpg"]["large_image_url"],
            "small_image_url": anime_data["images"]["webp"]["small_image_url"]
            if anime_data["images"]["webp"]
            else anime_data["images"]["jpg"]["small_image_url"],
        },
        "genres": [genre["name"] for genre in anime_data["genres"]],
        "studios": [studio["name"] for studio in anime_data["studios"]],
        "themes": [theme["name"] for theme in anime_data["themes"]],
        "episodes": [
            {
                "aired": datetime.strptime(episode["aired"], "%Y-%m-%dT%H:%M:%S%z").strftime(
                    "%b %d, %Y"
                )
                if episode["aired"]
                else "N/A",
                "number": episode["mal_id"],
                "title": episode["title"],
                "titleJapanese": episode.get("title_japanese"),
                "titleRomaji": episode.get("title_romanji"),
            }
            for episode in anime_episodes
        ],
        "synopsis": anime_data["synopsis"],
        "trailer": embed_url,
        "malUrl": anime_data["url"],
        "storylineRating": random.randint(1, 10),
        "qualityRating": random.randint(1, 10),
        "voiceActingRating": random.randint(1, 10),
        "soundTrackRating": random.randint(1, 10),
        "charDevelopmentRating": random.randint(1, 10),
        "consumedAt": consumed_at,
        "progressStatus": random.choice(statuses),
    }


def create_manga(manga_data):
    year = random.randint(2020, 2024)
    month = random.randint(1, 12)
    day = 1
    random_date = datetime(year, month, day)
    consumed_at = random_date.strftime("%Y-%m-%dT00:00:00.000Z")

    return {
        "malId": manga_data["mal_id"],
        "status": manga_data["status"],
        "title": manga_data["title"],
        "titleJapanese": manga_data["title_japanese"],
        "titleSynonyms": " ".join([synonym.lower() for synonym in manga_data["title_synonyms"]])
        if manga_data["title_synonyms"]
        else "",
        "published": (
            f"{datetime.strptime(manga_data['published']['from'], '%Y-%m-%dT%H:%M:%S%z').strftime('%b %d, %Y')} to "
            f"{datetime.strptime(manga_data['published']['to'], '%Y-%m-%dT%H:%M:%S%z').strftime('%b %d, %Y') if manga_data['published']['to'] else '?'}"
        )
        if manga_data["status"] != "Upcoming"
        else manga_data["status"],
        "chaptersCount": manga_data["chapters"],
        "volumesCount": manga_data["volumes"],
        "score": manga_data["score"],
        "images": {
            "image_url": manga_data["images"]["webp"]["image_url"]
            if manga_data["images"]["webp"]
            else manga_data["images"]["jpg"]["image_url"],
            "large_image_url": manga_data["images"]["webp"]["large_image_url"]
            if manga_data["images"]["webp"]
            else manga_data["images"]["jpg"]["large_image_url"],
            "small_image_url": manga_data["images"]["webp"]["small_image_url"]
            if manga_data["images"]["webp"]
            else manga_data["images"]["jpg"]["small_image_url"],
        },
        "authors": [author["name"] for author in manga_data["authors"]],
        "genres": [genre["name"] for genre in manga_data["genres"]],
        "themes": [theme["name"] for theme in manga_data["themes"]],
        "synopsis": manga_data["synopsis"],
        "malUrl": manga_data["url"],
        "storylineRating": random.randint(1, 10),
        "artStyleRating": random.randint(1, 10),
        "charDevelopmentRating": random.randint(1, 10),
        "worldBuildingRating": random.randint(1, 10),
        "originalityRating": random.randint(1, 10),
        "consumedAt": consumed_at,
        "progressStatus": random.choice(statuses),
    }


def create_lightnovel(lightnovel_data):
    year = random.randint(2020, 2024)
    month = random.randint(1, 12)
    day = 1
    random_date = datetime(year, month, day)
    consumed_at = random_date.strftime("%Y-%m-%dT00:00:00.000Z")

    return {
        "malId": lightnovel_data["mal_id"],
        "status": lightnovel_data["status"],
        "title": lightnovel_data["title"],
        "titleJapanese": lightnovel_data["title_japanese"],
        "titleSynonyms": " ".join(
            [synonym.lower() for synonym in lightnovel_data["title_synonyms"]]
        )
        if lightnovel_data["title_synonyms"]
        else "",
        "published": (
            f"{datetime.strptime(lightnovel_data['published']['from'], '%Y-%m-%dT%H:%M:%S%z').strftime('%b %d, %Y')} to "
            f"{datetime.strptime(lightnovel_data['published']['to'], '%Y-%m-%dT%H:%M:%S%z').strftime('%b %d, %Y') if lightnovel_data['published']['to'] else '?'}"
        )
        if lightnovel_data["status"] != "Upcoming"
        else lightnovel_data["status"],
        "chaptersCount": lightnovel_data["chapters"],
        "volumesCount": lightnovel_data["volumes"],
        "score": lightnovel_data["score"],
        "images": {
            "image_url": lightnovel_data["images"]["webp"]["image_url"]
            if lightnovel_data["images"]["webp"]
            else lightnovel_data["images"]["jpg"]["image_url"],
            "large_image_url": lightnovel_data["images"]["webp"]["large_image_url"]
            if lightnovel_data["images"]["webp"]
            else lightnovel_data["images"]["jpg"]["large_image_url"],
            "small_image_url": lightnovel_data["images"]["webp"]["small_image_url"]
            if lightnovel_data["images"]["webp"]
            else lightnovel_data["images"]["jpg"]["small_image_url"],
        },
        "authors": [author["name"] for author in lightnovel_data["authors"]],
        "genres": [genre["name"] for genre in lightnovel_data["genres"]],
        "themes": [theme["name"] for theme in lightnovel_data["themes"]],
        "synopsis": lightnovel_data["synopsis"],
        "malUrl": lightnovel_data["url"],
        "storylineRating": random.randint(1, 10),
        "worldBuildingRating": random.randint(1, 10),
        "writingStyleRating": random.randint(1, 10),
        "charDevelopmentRating": random.randint(1, 10),
        "originalityRating": random.randint(1, 10),
        "consumedAt": consumed_at,
        "progressStatus": random.choice(statuses),
    }


async def main():
    start_time = time.time()

    anime_ids = read_ids_from_file("anime_ids.txt")
    manga_ids = read_ids_from_file("manga_ids.txt")
    lightnovel_ids = read_ids_from_file("lightnovel_ids.txt")

    anime_payloads = []
    manga_payloads = []
    lightnovel_payloads = []

    anime_ids_length = len(anime_ids)
    manga_ids_length = len(manga_ids)
    lightnovel_ids_length = len(lightnovel_ids)

    async with AioJikan() as aio_jikan:
        for index, anime_id in enumerate(anime_ids, start=1):
            try:
                # Fetch anime data
                anime_data = await aio_jikan.anime(anime_id)
                anime_data = anime_data["data"]
                console.print(
                    f"[ANIME] Processing [bold]{anime_data["title"]}[/bold]...", style="blue"
                )

                # Fetch anime episodes
                anime_episodes = await aio_jikan.anime(anime_id, extension="episodes")
                anime_episodes = anime_episodes["data"]

                # Embed URL fix
                embed_url = (
                    anime_data["trailer"]["embed_url"].replace("autoplay=1", "autoplay=0")
                    if anime_data["trailer"]
                    else None
                )

                # Create anime payload
                anime_payload = create_anime(anime_data, anime_episodes, embed_url)
                anime_payloads.append(anime_payload)
                console.print(
                    f"({index}/{anime_ids_length}): [ANIME] [bold]{anime_data['title']}[/bold] added successfully!",
                    style="green",
                )
            except Exception as e:
                console.print(
                    f"Error fetching or processing anime ID [bold]{anime_id}[/bold]: {str(e)}",
                    style="red",
                )

            await asyncio.sleep(3)

        save_payload_to_json("anime_payloads", anime_payloads)

        for index, manga_id in enumerate(manga_ids, start=1):
            try:
                # Fetch manga data
                manga_data = await aio_jikan.manga(manga_id)
                manga_data = manga_data["data"]
                console.print(
                    f"[MANGA] Processing [bold]{manga_data["title"]}[/bold]...", style="blue"
                )

                # Create manga payload
                manga_payload = create_manga(manga_data)
                manga_payloads.append(manga_payload)
                console.print(
                    f"({index}/{manga_ids_length}): [MANGA] [bold]{manga_data['title']}[/bold] added successfully!",
                    style="green",
                )
            except Exception as e:
                console.print(
                    f"Error fetching or processing manga ID [bold]{manga_id}[/bold]: {str(e)}",
                    style="red",
                )

            await asyncio.sleep(3)

        save_payload_to_json("manga_payloads", manga_payloads)

        for index, lightnovel_id in enumerate(lightnovel_ids, start=1):
            try:
                # Fetch lightnovel data
                lightnovel_data = await aio_jikan.manga(lightnovel_id)
                lightnovel_data = lightnovel_data["data"]
                console.print(
                    f"[LIGHTNOVEL] Processing [bold]{lightnovel_data["title"]}[/bold]...",
                    style="blue",
                )

                # Create lightnovel payload
                lightnovel_payload = create_lightnovel(lightnovel_data)
                lightnovel_payloads.append(lightnovel_payload)
                console.print(
                    f"({index}/{lightnovel_ids_length}): [LIGHTNOVEL] [bold]{lightnovel_data['title']}[/bold] added successfully!",
                    style="green",
                )
            except Exception as e:
                console.print(
                    f"Error fetching or processing light novel ID [bold]{lightnovel_id}[/bold]: {str(e)}",
                    style="red",
                )

            await asyncio.sleep(3)

        save_payload_to_json("lightnovel_payloads", lightnovel_payloads)

    end_time = time.time()
    elapsed_time = end_time - start_time
    console.print(f"Time elapsed: {round(elapsed_time, 2)} seconds", style="blue")


if __name__ == "__main__":
    asyncio.run(main())
