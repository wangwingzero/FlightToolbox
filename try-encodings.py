# -*- coding: utf-8 -*-
# Try different encodings to find the correct one

import codecs

file_path = r"D:\FlightToolbox\miniprogram\packageRadiation\pages\index\index.wxml"

encodings = ['utf-8', 'gbk', 'gb2312', 'gb18030', 'big5', 'utf-16', 'utf-32', 'latin1', 'cp936']

print("Trying different encodings...")
print("=" * 60)

for encoding in encodings:
    try:
        with codecs.open(file_path, 'r', encoding=encoding, errors='ignore') as f:
            content = f.read(200)  # Read first 200 chars

        # Check if contains Chinese characters
        if any('\u4e00' <= char <= '\u9fff' for char in content):
            print(f"\n{encoding}:")
            print(content[:150])
            print("..." if len(content) > 150 else "")
            print("-" * 60)
    except Exception as e:
        print(f"{encoding}: Error - {e}")

print("\n" + "=" * 60)
print("Done!")
