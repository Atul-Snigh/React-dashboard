import requests

try:
    with open('track_url.txt', 'r') as f:
        url = f.read().strip()

    print(f"Fetching URL: {url[:100]}...")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Content Length: {len(response.content)}")
    print("\n--- CONTENT START ---")
    print(response.text[:2000])
    print("--- CONTENT END ---")

except Exception as e:
    print(f"Error: {e}")
