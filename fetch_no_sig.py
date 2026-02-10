import urllib.request

try:
    with open('track_url.txt', 'r') as f:
        original_url = f.read().strip()

    # Try removing signature
    import re
    url = re.sub(r'&signature=[^&]*', '', original_url)
    
    print(f"Fetching URL (no signature): {url[:100]}...")

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }

    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8')
            print(f"Status Code: {response.status}")
            print(f"Content Length: {len(content)}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} {e.reason}")

except Exception as e:
    print(f"Error: {e}")
