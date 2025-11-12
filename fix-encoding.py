# -*- coding: utf-8 -*-
# Fix file encoding from GBK to UTF-8

import codecs
import os

def fix_file_encoding(file_path):
    """Convert file from GBK to UTF-8"""
    try:
        # Read with GBK encoding
        with codecs.open(file_path, 'r', encoding='gbk', errors='ignore') as f:
            content = f.read()

        # Write with UTF-8 encoding
        with codecs.open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"Success: Fixed {file_path}")
        return True
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

# Fix the files
wxml_file = r"D:\FlightToolbox\miniprogram\packageRadiation\pages\index\index.wxml"
js_file = r"D:\FlightToolbox\miniprogram\packageRadiation\pages\index\index.js"

print("Fixing index.wxml encoding...")
fix_file_encoding(wxml_file)

print("\nFixing index.js encoding...")
fix_file_encoding(js_file)

print("\nEncoding fix completed!")
