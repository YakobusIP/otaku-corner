import asyncio
import aiohttp
import time
from datetime import datetime
from jikanpy import AioJikan
from rich.console import Console
from rich.pretty import pprint

console = Console()

success_count = 0
failure_count = 0
failed_ids = []


async def create_anime(session, anime_data, anime_episodes, embed_url):
    global success_count, failure_count, failed_ids

    anime_payload = {
        "malId": anime_data["mal_id"],
        "type": anime_data["type"],
        "status": anime_data["status"],
        "rating": anime_data.get("rating", "Unrated"),
        "season": f"{anime_data["season"].upper()} {anime_data["year"]}"
        if anime_data["season"]
        else None,
        "title": anime_data["title"],
        "titleJapanese": anime_data["title_japanese"],
        "titleSynonyms": " ".join(
            [synonym.lower() for synonym in anime_data["title_synonyms"]]
        ),
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
                "aired": datetime.strptime(
                    episode["aired"], "%Y-%m-%dT%H:%M:%S%z"
                ).strftime("%b %d, %Y")
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
    }

    backend_url = "http://localhost:3000/api/anime"

    try:
        async with session.post(backend_url, json=anime_payload) as response:
            if response.status == 201:
                console.print(
                    f"Anime [bold]{anime_data['title']}[/bold] created successfully!",
                    style="green",
                )
                success_count += 1
            else:
                console.print(
                    f"Failed to create anime {anime_data['title']}: {response.status}",
                    style="red",
                )
                failure_count += 1
                failed_ids.append(anime_data["mal_id"])
    except Exception as e:
        console.print(
            f"Error while creating anime {anime_data['title']}: {str(e)}", style="red"
        )
        failure_count += 1
        failed_ids.append(anime_data["mal_id"])

    print("\n")


async def create_manga(session, manga_data):
    global success_count, failure_count, failed_ids

    manga_payload = {
        "malId": manga_data["mal_id"],
        "status": manga_data["status"],
        "title": manga_data["title"],
        "titleJapanese": manga_data["title_japanese"],
        "titleSynonyms": " ".join(
            [synonym.lower() for synonym in manga_data["title_synonyms"]]
        )
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
    }

    backend_url = "http://localhost:3000/api/manga"

    try:
        async with session.post(backend_url, json=manga_payload) as response:
            if response.status == 201:
                console.print(
                    f"Manga [bold]{manga_data['title']}[/bold] created successfully!",
                    style="green",
                )
                success_count += 1
            else:
                console.print(
                    f"Failed to create manga {manga_data['title']}: {response.status}",
                    style="red",
                )
                failure_count += 1
                failed_ids.append(manga_data["mal_id"])
                pprint(manga_payload)
    except Exception as e:
        console.print(
            f"Error while creating anime {manga_data['title']}: {str(e)}", style="red"
        )
        failure_count += 1
        failed_ids.append(manga_data["mal_id"])


async def create_lightnovel(session, lightnovel_data):
    global success_count, failure_count, failed_ids

    lightnovel_payload = {
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
    }

    backend_url = "http://localhost:3000/api/lightnovel"

    try:
        async with session.post(backend_url, json=lightnovel_payload) as response:
            if response.status == 201:
                console.print(
                    f"Light Novel [bold]{lightnovel_data['title']}[/bold] created successfully!",
                    style="green",
                )
                success_count += 1
            else:
                console.print(
                    f"Failed to create light novel {lightnovel_data['title']}: {response.status}",
                    style="red",
                )
                failure_count += 1
                failed_ids.append(lightnovel_data["mal_id"])
                pprint(lightnovel_payload)
    except Exception as e:
        console.print(
            f"Error while creating anime {lightnovel_data['title']}: {str(e)}",
            style="red",
        )
        failure_count += 1
        failed_ids.append(lightnovel_data["mal_id"])


async def main():
    global success_count, failure_count, failed_ids
    start_time = time.time()

    anime_ids = [
        54744,
        50803,
        52481,
        54968,
        51122,
        54492,
        41457,
        48569,
        48675,
        51705,
        22147,
        38778,
        37475,
        47917,
        40530,
        15583,
        19163,
        36633,
        41461,
        51417,
        38680,
        40417,
        49310,
        42938,
        37105,
        56230,
        49692,
        40938,
        11617,
        24703,
        34281,
        15451,
        42897,
        54856,
        31338,
        36098,
        31245,
        50796,
        37999,
        43608,
        40591,
        6045,
        48926,
        50631,
        38080,
        38889,
        51815,
        50709,
        7054,
        33487,
        48736,
        51552,
        51265,
        53126,
        49470,
        14813,
        39547,
        23847,
        18897,
        27787,
        20507,
        30503,
        7769,
        30276,
        34134,
        38483,
        52990,
        40595,
        36220,
        37450,
        52619,
        40839,
        42963,
        52082,
        38992,
        43470,
        38787,
        45613,
        50416,
        30123,
        12549,
        50265,
        47194,
        50594,
        50739,
        16782,
        47159,
        54234,
        51916,
        33036,
        38101,
        39783,
        48548,
        50593,
        49776,
        52305,
        41389,
        4224,
        34822,
        34902,
    ]

    manga_ids = [
        123602,
        156291,
        112589,
        147082,
        130633,
        142815,
        164769,
        143031,
        147528,
        45143,
        152087,
        115848,
        139073,
        128634,
        125052,
        152117,
        121433,
        160983,
        108407,
    ]

    lightnovel_ids = [133757, 133352, 102702, 135688, 132505, 25409, 123649]

    async with AioJikan() as aio_jikan, aiohttp.ClientSession() as session:
        for anime_id in anime_ids:
            try:
                # Fetch anime data
                anime_data = await aio_jikan.anime(anime_id)
                anime_data = anime_data["data"]
                console.print(
                    f"Processing [bold]{anime_data["title"]}[/bold]...", style="blue"
                )

                # Fetch anime episodes
                anime_episodes = await aio_jikan.anime(anime_id, extension="episodes")
                anime_episodes = anime_episodes["data"]

                # Embed URL fix
                embed_url = (
                    anime_data["trailer"]["embed_url"].replace(
                        "autoplay=1", "autoplay=0"
                    )
                    if anime_data["trailer"]
                    else None
                )

                # Create anime in the backend
                await create_anime(session, anime_data, anime_episodes, embed_url)
            except Exception as e:
                console.print(
                    f"Error fetching or processing anime ID [bold]{anime_id}[/bold]: {str(e)}",
                    style="red",
                )
                failure_count += 1
                failed_ids.append(anime_id)

            await asyncio.sleep(3)

        for manga_id in manga_ids:
            try:
                # Fetch manga data
                manga_data = await aio_jikan.manga(manga_id)
                manga_data = manga_data["data"]
                console.print(
                    f"Processing [bold]{manga_data["title"]}[/bold]...", style="blue"
                )

                # Create manga in the backend
                await create_manga(session, manga_data)
            except Exception as e:
                console.print(
                    f"Error fetching or processing manga ID [bold]{manga_id}[/bold]: {str(e)}",
                    style="red",
                )
                failure_count += 1
                failed_ids.append(manga_id)

            await asyncio.sleep(3)

        for lightnovel_id in lightnovel_ids:
            try:
                # Fetch lightnovel data
                lightnovel_data = await aio_jikan.manga(lightnovel_id)
                lightnovel_data = lightnovel_data["data"]
                console.print(
                    f"Processing [bold]{lightnovel_data["title"]}[/bold]...",
                    style="blue",
                )

                # Create lightnovel in the backend
                await create_lightnovel(session, lightnovel_data)
            except Exception as e:
                console.print(
                    f"Error fetching or processing light novel ID [bold]{lightnovel_id}[/bold]: {str(e)}",
                    style="red",
                )
                failure_count += 1
                failed_ids.append(lightnovel_id)

            await asyncio.sleep(3)

    # Summary at the end
    console.print("\nSummary:", style="bold yellow")
    console.print(f"Successful media creations: {success_count}", style="green")
    console.print(f"Failed media creations: {failure_count}", style="red")
    if failed_ids:
        console.print(f"Failed media IDs: {failed_ids}", style="red")

    end_time = time.time()
    elapsed_time = end_time - start_time
    console.print(f"Time elapsed: {elapsed_time} seconds", style="blue")


if __name__ == "__main__":
    asyncio.run(main())
