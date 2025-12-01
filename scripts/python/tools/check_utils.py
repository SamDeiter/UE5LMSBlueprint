
with open('utils.js', 'rb') as f:
    f.seek(-50, 2)
    print(f.read())
