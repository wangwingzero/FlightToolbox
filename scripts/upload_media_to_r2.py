#!/usr/bin/env python3
"""
Upload walkaround images and audio recordings to Cloudflare R2 via Worker proxy.

Usage:
    python scripts/upload_media_to_r2.py [--images] [--audio] [--dry-run]

Requires env vars (or will prompt):
    R2_WORKER_URL   - e.g. https://r2-upload.hudawang.cn
    R2_WORKER_SECRET - Worker auth secret
"""

import argparse
import os
import sys
import time
from pathlib import Path
from urllib.parse import quote

import httpx

# FlightToolbox miniprogram root
MINIPROGRAM_DIR = Path(__file__).resolve().parent.parent / "miniprogram"

# R2 path prefixes
IMAGE_PREFIX = "walkaround/v1"
AUDIO_PREFIX = "audio/v1"

# Image subpackage mapping: local dir -> R2 subdir
IMAGE_PACKAGES = {
    "packageWalkaroundImages1/images1": "images1",
    "packageWalkaroundImages2/images2": "images2",
    "packageWalkaroundImages3/images3": "images3",
    "packageWalkaroundImages4/images4": "images4",
    "packageWalkaroundImagesShared/images": "shared",
}

# Audio subpackages (31 countries)
AUDIO_PACKAGES = [
    "packageJapan", "packagePhilippines", "packageKorean", "packageSingapore",
    "packageThailand", "packageRussia", "packageSrilanka", "packageAustralia",
    "packageTurkey", "packageFrance", "packageAmerica", "packageItaly",
    "packageUAE", "packageUK", "packageTaipei", "packageMacau",
    "packageHongKong", "packageCanada", "packageEgypt", "packageNewZealand",
    "packageMalaysia", "packageIndonesia", "packageVietnam", "packageIndia",
    "packageCambodia", "packageMyanmar", "packageUzbekistan", "packageMaldive",
    "packageSpain", "packageGermany", "packageHolland",
]

CONTENT_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".mp3": "audio/mpeg",
}


def collect_image_files() -> list[tuple[Path, str]]:
    """Collect all walkaround images. Returns [(local_path, r2_key), ...]"""
    files = []
    for local_subdir, r2_subdir in IMAGE_PACKAGES.items():
        local_dir = MINIPROGRAM_DIR / local_subdir
        if not local_dir.exists():
            print(f"  SKIP (not found): {local_dir}")
            continue
        for f in sorted(local_dir.rglob("*.png")):
            # Preserve subdirectory structure (e.g. shared/common/xxx.png)
            rel = f.relative_to(local_dir)
            r2_key = f"{IMAGE_PREFIX}/{r2_subdir}/{rel.as_posix()}"
            files.append((f, r2_key))
    return files


def collect_audio_files() -> list[tuple[Path, str]]:
    """Collect all audio recordings. Returns [(local_path, r2_key), ...]"""
    files = []
    for pkg in AUDIO_PACKAGES:
        local_dir = MINIPROGRAM_DIR / pkg
        if not local_dir.exists():
            print(f"  SKIP (not found): {local_dir}")
            continue
        for f in sorted(local_dir.rglob("*.mp3")):
            rel = f.relative_to(local_dir)
            r2_key = f"{AUDIO_PREFIX}/{pkg}/{rel.as_posix()}"
            files.append((f, r2_key))
    return files


def upload_files(
    files: list[tuple[Path, str]],
    worker_url: str,
    secret: str,
    dry_run: bool = False,
) -> tuple[int, int, int]:
    """Upload files to R2 via Worker proxy. Returns (uploaded, skipped, failed)."""
    uploaded = 0
    skipped = 0
    failed = 0
    total = len(files)

    # Auto-detect proxy from environment (needed for local network with Clash/V2Ray)
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("HTTP_PROXY") or os.environ.get("https_proxy") or os.environ.get("http_proxy")
    client_kwargs = {"timeout": 60, "follow_redirects": True}
    if proxy:
        client_kwargs["proxy"] = proxy
        print(f"  Using proxy: {proxy}")
    client = httpx.Client(**client_kwargs)

    try:
        for i, (local_path, r2_key) in enumerate(files, 1):
            ext = local_path.suffix.lower()
            content_type = CONTENT_TYPES.get(ext, "application/octet-stream")
            size_kb = local_path.stat().st_size / 1024

            if dry_run:
                print(f"  [{i}/{total}] DRY RUN: {r2_key} ({size_kb:.1f} KB)")
                skipped += 1
                continue

            encoded_key = quote(r2_key, safe="/")
            url = f"{worker_url}/{encoded_key}"

            try:
                success = False
                for attempt in range(3):
                    try:
                        with open(local_path, "rb") as f:
                            resp = client.put(
                                url,
                                content=f,
                                headers={
                                    "X-Auth-Token": secret,
                                    "Content-Type": content_type,
                                },
                            )

                        if resp.status_code == 200:
                            uploaded += 1
                            if i % 50 == 0 or i == total:
                                print(f"  [{i}/{total}] Uploaded: {r2_key} ({size_kb:.1f} KB)")
                            success = True
                            break
                        else:
                            failed += 1
                            print(f"  [{i}/{total}] FAILED ({resp.status_code}): {r2_key}")
                            print(f"    Response: {resp.text[:200]}")
                            success = True  # Don't retry HTTP errors
                            break

                    except Exception as retry_err:
                        if attempt < 2:
                            time.sleep(2 * (attempt + 1))
                            continue
                        raise retry_err

                if not success:
                    failed += 1
                    print(f"  [{i}/{total}] ERROR: {r2_key}: max retries exceeded")

                # Small delay to avoid overwhelming the Worker
                if i % 100 == 0:
                    time.sleep(0.5)

            except Exception as e:
                failed += 1
                print(f"  [{i}/{total}] ERROR: {r2_key}: {e}")

    finally:
        client.close()

    return uploaded, skipped, failed


def main():
    parser = argparse.ArgumentParser(description="Upload media files to Cloudflare R2")
    parser.add_argument("--images", action="store_true", help="Upload walkaround images")
    parser.add_argument("--audio", action="store_true", help="Upload audio recordings")
    parser.add_argument("--dry-run", action="store_true", help="List files without uploading")
    parser.add_argument("--yes", "-y", action="store_true", help="Skip confirmation prompt")
    args = parser.parse_args()

    # Default: upload both
    if not args.images and not args.audio:
        args.images = True
        args.audio = True

    worker_url = os.environ.get("R2_WORKER_URL", "").strip().rstrip("/")
    secret = os.environ.get("R2_WORKER_SECRET", "").strip()

    if not args.dry_run:
        if not worker_url:
            worker_url = input("R2_WORKER_URL: ").strip().rstrip("/")
        if not secret:
            secret = input("R2_WORKER_SECRET: ").strip()
        if not worker_url or not secret:
            print("ERROR: R2_WORKER_URL and R2_WORKER_SECRET are required")
            sys.exit(1)

    print(f"Miniprogram dir: {MINIPROGRAM_DIR}")
    if not MINIPROGRAM_DIR.exists():
        print(f"ERROR: {MINIPROGRAM_DIR} does not exist")
        sys.exit(1)

    all_files: list[tuple[Path, str]] = []

    if args.images:
        print("\n=== Collecting walkaround images ===")
        image_files = collect_image_files()
        print(f"Found {len(image_files)} image files")
        all_files.extend(image_files)

    if args.audio:
        print("\n=== Collecting audio recordings ===")
        audio_files = collect_audio_files()
        print(f"Found {len(audio_files)} audio files")
        all_files.extend(audio_files)

    if not all_files:
        print("No files to upload")
        sys.exit(0)

    total_size = sum(f.stat().st_size for f, _ in all_files)
    print(f"\nTotal: {len(all_files)} files, {total_size / 1024 / 1024:.1f} MB")

    if not args.dry_run and not args.yes:
        print(f"Worker: {worker_url}")
        confirm = input("\nProceed with upload? [y/N] ").strip().lower()
        if confirm != "y":
            print("Aborted")
            sys.exit(0)

    print("\n=== Uploading ===")
    uploaded, skipped, failed = upload_files(all_files, worker_url, secret, args.dry_run)

    print(f"\n=== Done ===")
    print(f"Uploaded: {uploaded}")
    print(f"Skipped:  {skipped}")
    print(f"Failed:   {failed}")

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
