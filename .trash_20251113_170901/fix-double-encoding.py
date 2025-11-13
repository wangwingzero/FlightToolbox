# -*- coding: utf-8 -*-
# Fix double-encoded UTF-8 file

import codecs

def fix_double_encoding(file_path):
    """Fix double-encoded UTF-8 file"""
    try:
        # Step 1: Read as latin1 (treats each byte as a character)
        with codecs.open(file_path, 'r', encoding='latin1') as f:
            content = f.read()

        # Step 2: Encode back to bytes using latin1
        byte_content = content.encode('latin1')

        # Step 3: Decode as UTF-8 (the original encoding)
        fixed_content = byte_content.decode('utf-8')

        #Step 4: Write back as UTF-8
        with codecs.open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)

        print(f"Success: Fixed {file_path}")
        # Show first 200 chars as preview
        print("\nPreview:")
        print(fixed_content[:200])
        return True
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

# Fix the files
wxml_file = r"D:\FlightToolbox\miniprogram\packageRadiation\pages\index\index.wxml"
js_file = r"D:\FlightToolbox\miniprogram\packageRadiation\pages\index\index.js"

print("Fixing index.wxml double-encoding...")
print("=" * 60)
fix_double_encoding(wxml_file)

print("\n" + "=" * 60)
print("\nFixing index.js double-encoding...")
print("=" * 60)
fix_double_encoding(js_file)

print("\n" + "=" * 60)
print("Double-encoding fix completed!")
