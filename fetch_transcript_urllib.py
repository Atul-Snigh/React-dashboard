import urllib.request

try:
    with open('track_url.txt', 'r') as f:
        url = f.read().strip()

    print(f"Fetching URL: {url[:100]}...")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
    }

    req = urllib.request.Request(url, headers=headers)
    
    with urllib.request.urlopen(req) as response:
        content = response.read().decode('utf-8')
        print(f"Status Code: {response.status}")
        print(f"Content Length: {len(content)}")
        print("\n--- CONTENT START ---")
        print(content[:2000])
        print("--- CONTENT END ---")

except Exception as e:
    print(f"Error: {e}")
