# -*- coding: utf-8 -*-
# Analyze the actual bytes to understand the encoding issue

import sys

file_path = r"D:\FlightToolbox\miniprogram\packageRadiation\pages\index\index.wxml"

# Read first 100 bytes
with open(file_path, 'rb') as f:
    raw_bytes = f.read(100)

print("Raw bytes (hex):")
print(' '.join(f'{b:02x}' for b in raw_bytes))
print("\n")

# Try to decode different ways
print("UTF-8 decode (ignore errors):")
try:
    text_utf8 = raw_bytes.decode('utf-8', errors='replace')
    print(repr(text_utf8[:80]))
except:
    pass

print("\nLatin1 decode then UTF-8:")
try:
    # This is the double-encoding fix approach
    text_latin1 = raw_bytes.decode('latin1')
    print("Latin1 text:", repr(text_latin1[:80]))
    # Try to re-encode as latin1 and decode as UTF-8
    text_fixed = text_latin1.encode('latin1').decode('utf-8', errors='replace')
    print("Fixed text:", repr(text_fixed[:80]))
except Exception as e:
    print(f"Error: {e}")

print("\nGBK decode:")
try:
    text_gbk = raw_bytes.decode('gbk', errors='replace')
    print(repr(text_gbk[:80]))
except:
    pass

# Check if file has BOM
if raw_bytes[:3] == b'\xef\xbb\xbf':
    print("\nFile has UTF-8 BOM")
elif raw_bytes[:2] == b'\xff\xfe':
    print("\nFile has UTF-16 LE BOM")
elif raw_bytes[:2] == b'\xfe\xff':
    print("\nFile has UTF-16 BE BOM")
else:
    print("\nNo BOM detected")
