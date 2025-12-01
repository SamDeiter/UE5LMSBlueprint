
import re

def scan_css():
    with open('style.css', 'r', encoding='utf-8') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if line.strip().startswith('/*') and '---' in line:
            print(f"Line {i+1}: {line.strip()}")

if __name__ == '__main__':
    scan_css()
