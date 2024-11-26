import os
import json
import aiohttp
import asyncio
from rich.console import Console

console = Console()
success_count = 0
failure_count = 0
failed_ids = []


async def post_payload(session: aiohttp.ClientSession, payload, media_type: str):
    global success_count, failure_count, failed_ids
    backend_url = f"http://localhost:3000/api/{media_type}"

    try:
        async with session.post(backend_url, json=payload) as response:
            if response.status == 201:
                console.print(
                    f"[{media_type.upper()}]: [bold]{payload['title']}[/bold] {media_type} created successfully!",
                    style="green",
                )
                success_count += 1
            else:
                console.print(
                    f"Failed to create {media_type} {payload['title']}: {response.status}",
                    style="red",
                )
                failure_count += 1
                failed_ids.append(payload["mal_id"])
    except Exception as e:
        console.print(
            f"Error while creating {media_type} {payload['title']}: {str(e)}", style="red"
        )


async def main():
    async with aiohttp.ClientSession() as session:
        media_cache_path = "media_cache"

        for filename in os.listdir(media_cache_path):
            if filename.endswith(".json"):
                filepath = os.path.join(media_cache_path, filename)

                with open(filepath, "r") as file:
                    data = json.load(file)
                    for payload in data:
                        media_type = (
                            "anime"
                            if "anime" in filename
                            else "manga"
                            if "manga" in filename
                            else "light-novel"
                        )
                        await post_payload(session, payload, media_type)

    # Summary at the end
    console.print("\nSummary:", style="bold yellow")
    console.print(f"Successful media creations: {success_count}", style="green")
    console.print(f"Failed media creations: {failure_count}", style="red")
    if len(failed_ids) > 0:
        console.print(f"Failed media IDs: {failed_ids}", style="red")


if __name__ == "__main__":
    asyncio.run(main())
