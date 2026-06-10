#!/usr/bin/env python3
"""Deploy client/dist to Netlify site 9ca8fe0c-4f76-4c79-a3be-1b000619cdd7"""
import os, hashlib, json, urllib.request, urllib.error

SITE_ID   = "9ca8fe0c-4f76-4c79-a3be-1b000619cdd7"
TOKEN     = "nfc_R61P9JuJGWQqYWVuee85XW1xuEdKy77Rbb43"
DIST_DIR  = os.path.join(os.path.dirname(__file__), "client", "dist")
API       = "https://api.netlify.com/api/v1"
HEADERS   = {
    "Authorization": f"Bearer {TOKEN}",
    "User-Agent": "netlify-cli/22.0.0",
    "Content-Type": "application/json",
}

def sha1(path):
    h = hashlib.sha1()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

# Collect all files
files = {}
for root, _, fnames in os.walk(DIST_DIR):
    for fname in fnames:
        full = os.path.join(root, fname)
        rel  = "/" + os.path.relpath(full, DIST_DIR).replace("\\", "/")
        files[rel] = sha1(full)

print(f"Files to deploy: {len(files)}")

# Create deploy
body = json.dumps({
    "files": files,
    "deploy_source": "cli",
    "branch": "master",
}).encode()
req = urllib.request.Request(f"{API}/sites/{SITE_ID}/deploys", data=body, headers=HEADERS, method="POST")
try:
    with urllib.request.urlopen(req) as r:
        deploy = json.loads(r.read())
except urllib.error.HTTPError as e:
    print("Create deploy error:", e.code, e.read().decode())
    raise

deploy_id = deploy["id"]
print(f"Deploy ID: {deploy_id}")
required = deploy.get("required", [])
print(f"Files to upload: {len(required)}")

# Build sha→path map
sha_map = {v: k for k, v in files.items()}

# Upload required files
uploaded = 0
for sha in required:
    rel_path = sha_map.get(sha)
    if not rel_path:
        print(f"  WARNING: sha {sha} not found in local files")
        continue
    full_path = os.path.join(DIST_DIR, rel_path.lstrip("/").replace("/", os.sep))
    with open(full_path, "rb") as f:
        data = f.read()
    ext = os.path.splitext(rel_path)[1].lower()
    ct_map = {
        ".html": "text/html", ".css": "text/css", ".js": "application/javascript",
        ".json": "application/json", ".svg": "image/svg+xml",
        ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
        ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
        ".webp": "image/webp", ".txt": "text/plain",
    }
    ct = ct_map.get(ext, "application/octet-stream")
    up_headers = {**HEADERS, "Content-Type": ct}
    url = f"{API}/deploys/{deploy_id}/files{rel_path}"
    req2 = urllib.request.Request(url, data=data, headers=up_headers, method="PUT")
    try:
        with urllib.request.urlopen(req2) as r:
            r.read()
        uploaded += 1
        print(f"  [{uploaded}/{len(required)}] {rel_path}")
    except urllib.error.HTTPError as e:
        print(f"  UPLOAD ERROR {rel_path}: {e.code} {e.read().decode()[:200]}")

# Publish deploy
pub_req = urllib.request.Request(
    f"{API}/sites/{SITE_ID}/deploys/{deploy_id}/restore",
    data=b"{}",
    headers=HEADERS,
    method="POST",
)
try:
    with urllib.request.urlopen(pub_req) as r:
        pub = json.loads(r.read())
    print(f"\n✅ Published! State: {pub.get('state')}")
    print(f"   URL: {pub.get('deploy_ssl_url') or pub.get('deploy_url') or 'https://dynamic-eclair-b04019.netlify.app'}")
except urllib.error.HTTPError as e:
    print("Publish error:", e.code, e.read().decode())
