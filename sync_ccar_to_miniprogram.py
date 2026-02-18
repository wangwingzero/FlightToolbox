#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CCAR 数据同步助手

将本地抓取的 JS 数据文件复制到 FlightToolbox 小程序目录。
自动识别文件类型并重命名为小程序期望的文件名。

用法：
  直接运行（自动查找最新的 CAAC_数据 目录）：
    python sync_ccar_to_miniprogram.py

  指定源目录：
    python sync_ccar_to_miniprogram.py D:/法规文件/CAAC_数据/20260212

  指定源和目标目录：
    python sync_ccar_to_miniprogram.py D:/法规文件/CAAC_数据/20260212 D:/FlightToolbox/miniprogram/packageCCAR
"""

import os
import re
import shutil
import sys
from pathlib import Path

# 文件名 → 小程序目标名的映射（按优先级顺序）
FILE_MAPPING = [
    ("CCAR规章", "regulation.js"),
    ("规范性文件", "normative.js"),
    ("标准规范", "specification.js"),
]

# 默认目标目录
DEFAULT_TARGET = Path(__file__).parent / "miniprogram" / "packageCCAR"

# 默认源数据根目录
DEFAULT_DATA_ROOT = Path(r"D:\法规文件\CAAC_数据")


def find_source_file(src_dir: Path, prefix: str) -> Path | None:
    """在源目录中查找匹配前缀的 JS 文件（不区分大小写）"""
    lower_prefix = prefix.lower()
    candidates = [
        f for f in src_dir.glob("*.js")
        if f.stem.lower().startswith(lower_prefix)
    ]
    if not candidates:
        return None
    return sorted(candidates, reverse=True)[0]


def find_latest_data_dir(root: Path) -> Path | None:
    """查找最新的数据子目录（按日期排序）"""
    if not root.exists():
        return None
    dirs = [d for d in root.iterdir() if d.is_dir() and re.match(r"\d{8}", d.name)]
    if not dirs:
        return None
    return sorted(dirs, key=lambda d: d.name, reverse=True)[0]


def sync(src_dir: Path, target_dir: Path, dry_run: bool = False) -> list[tuple[str, str]]:
    """同步文件，返回 [(源文件, 目标文件)] 列表"""
    results = []

    for prefix, target_name in FILE_MAPPING:
        src_file = find_source_file(src_dir, prefix)
        if not src_file:
            print(f"  [skip] {prefix}*.js not found in {src_dir}")
            continue

        target_file = target_dir / target_name

        if dry_run:
            print(f"  [dry-run] {src_file.name} -> {target_name}")
        else:
            shutil.copy2(src_file, target_file)
            print(f"  [ok] {src_file.name} -> {target_name}")

        results.append((str(src_file), str(target_file)))

    return results


def main():
    # 解析参数
    args = sys.argv[1:]
    dry_run = "--dry-run" in args
    args = [a for a in args if a != "--dry-run"]

    if len(args) >= 2:
        src_dir = Path(args[0])
        target_dir = Path(args[1])
    elif len(args) == 1:
        src_dir = Path(args[0])
        target_dir = DEFAULT_TARGET
    else:
        # 自动查找最新数据目录
        latest = find_latest_data_dir(DEFAULT_DATA_ROOT)
        if latest:
            src_dir = latest
            print(f"Auto-detected latest data: {src_dir}")
        else:
            print(f"No data directories found in {DEFAULT_DATA_ROOT}")
            print(f"Usage: {sys.argv[0]} <source_dir> [target_dir]")
            sys.exit(1)
        target_dir = DEFAULT_TARGET

    if not src_dir.exists():
        print(f"Source directory not found: {src_dir}")
        sys.exit(1)

    if not target_dir.exists():
        print(f"Target directory not found: {target_dir}")
        sys.exit(1)

    print(f"Source:  {src_dir}")
    print(f"Target:  {target_dir}")
    print()

    results = sync(src_dir, target_dir, dry_run=dry_run)

    if not results:
        print("\nNo files synced.")
    else:
        print(f"\nSynced {len(results)} file(s).")


if __name__ == "__main__":
    main()
