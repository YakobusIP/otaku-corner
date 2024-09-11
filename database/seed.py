import asyncio
import aiohttp
from datetime import datetime
from jikanpy import AioJikan
from rich.console import Console
from rich.pretty import pprint

console = Console()

success_count = 0
failure_count = 0
failed_anime_ids = []

async def create_anime(session, anime_data, anime_episodes, embed_url):
    global success_count, failure_count, failed_anime_ids

    anime_payload = {
        "malId": anime_data["mal_id"],
        "type": anime_data["type"],
        "status": anime_data["status"],
        "rating": anime_data.get("rating", "Unrated"),
        "season": f"{anime_data['season'].upper()} {anime_data['year']}" if anime_data["season"] else None,
        "title": anime_data["title"],
        "titleJapanese": anime_data["title_japanese"],
        "titleSynonyms": " ".join([synonym.lower() for synonym in anime_data["title_synonyms"]]),
        "source": anime_data["source"],
        "aired": (f"{datetime.strptime(anime_data['aired']['from'], '%Y-%m-%dT%H:%M:%S%z').strftime('%b %d, %Y')} to "
                  f"{datetime.strptime(anime_data['aired']['to'], '%Y-%m-%dT%H:%M:%S%z').strftime('%b %d, %Y') if anime_data['aired']['to'] else '?'}")
                if anime_data["type"] == "TV" and anime_data["status"] != "Not yet aired" else anime_data["status"],
        "broadcast": anime_data.get("broadcast", {}).get("string", "N/A"),
        "episodesCount": anime_data["episodes"],
        "duration": anime_data["duration"],
        "score": anime_data["score"],
        "images": {
            "image_url": anime_data["images"]["webp"]["image_url"] if anime_data["images"]["webp"] else anime_data["images"]["jpg"]["image_url"],
            "large_image_url": anime_data["images"]["webp"]["large_image_url"] if anime_data["images"]["webp"] else anime_data["images"]["jpg"]["large_image_url"],
            "small_image_url": anime_data["images"]["webp"]["small_image_url"] if anime_data["images"]["webp"] else anime_data["images"]["jpg"]["small_image_url"]
        },
        "genres": [genre["name"] for genre in anime_data["genres"]],
        "studios": [studio["name"] for studio in anime_data["studios"]],
        "themes": [theme["name"] for theme in anime_data["themes"]],
        "episodes": [{
            "aired": datetime.strptime(episode["aired"], '%Y-%m-%dT%H:%M:%S%z').strftime('%b %d, %Y') if episode["aired"] else "N/A",
            "number": episode["mal_id"],
            "title": episode["title"],
            "titleJapanese": episode.get("title_japanese"),
            "titleRomaji": episode.get("title_romanji")
        } for episode in anime_episodes],
        "synopsis": anime_data["synopsis"],
        "trailer": embed_url,
        "malUrl": anime_data["url"]
    }

    backend_url = "http://localhost:3000/api/anime"

    try:
        async with session.post(backend_url, json=anime_payload) as response:
            if response.status == 201:
                console.print(f"Anime [bold]{anime_data['title']}[/bold] created successfully!", style="green")
                success_count += 1
            else:
                console.print(f"Failed to create anime {anime_data['title']}: {response.status}", style="red")
                failure_count += 1
                failed_anime_ids.append(anime_data["mal_id"])
    except Exception as e:
        console.print(f"Error while creating anime '{anime_data['title']}': {str(e)}", style="red")
        failure_count += 1
        failed_anime_ids.append(anime_data["mal_id"])
    
    print("\n")

async def main():
    anime_ids = [
        54744, 50803, 52481, 54968, 51122, 54492, 41457, 48569, 48675, 51705, 
        22147, 38778, 37475, 47917, 40530, 15583, 19163, 36633, 41461, 51417,
        38680, 40417, 49310, 42938, 37105, 56230, 49692, 40938, 11617, 24703,
        34281, 15451, 42897, 54856, 31338, 36098, 31245, 50796, 37999, 43608,
        40591, 6045, 48926, 50631, 38080, 38889, 51815, 50709, 7054, 33487,
        48736, 51552, 51265, 53126, 49470, 14813, 39547, 23847, 18897, 27787,
        20507, 30503, 7769, 30276, 34134, 38483, 52990, 40595, 36220, 37450,
        52619, 40839, 42963, 52082, 38992, 43470, 38787, 45613, 50416, 30123,
        12549, 50265, 47194, 50594, 50739, 16782, 47159, 54234, 51916, 33036,
        38101, 39783, 48548, 50593, 49776, 52305, 41389, 4224, 34822, 34902]

    async with AioJikan() as aio_jikan, aiohttp.ClientSession() as session:
        for anime_id in anime_ids:
            try:
                # Fetch anime data
                anime_data = await aio_jikan.anime(anime_id)
                anime_data = anime_data["data"]
                console.print(f"Processing [bold]{anime_data['title']}[/bold]...", style="blue")

                # Fetch anime episodes
                anime_episodes = await aio_jikan.anime(anime_id, extension='episodes')
                anime_episodes = anime_episodes["data"]

                # Embed URL fix
                embed_url = anime_data["trailer"]["embed_url"].replace("autoplay=1", "autoplay=0") if anime_data["trailer"] else None

                # Create anime in the backend
                await create_anime(session, anime_data, anime_episodes, embed_url)
            except Exception as e:
                console.print(f"Error fetching or processing anime ID [bold]{anime_id}[/bold]: {str(e)}", style="red")
                failure_count += 1
                failed_anime_ids.append(anime_id)

            await asyncio.sleep(3)

    # Summary at the end
    console.print(f"\nSummary:", style="bold yellow")
    console.print(f"Successful anime creations: {success_count}", style="green")
    console.print(f"Failed anime creations: {failure_count}", style="red")
    if failed_anime_ids:
        console.print(f"Failed anime IDs: {failed_anime_ids}", style="red")

if __name__ == "__main__":
    asyncio.run(main()) 