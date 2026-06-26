with open("/home/ubuntu/portfolio/.env", "r") as f:
    lines = f.readlines()

fixed = []
for line in lines:
    stripped = line.strip()
    if not stripped or stripped.startswith("#"):
        fixed.append(line)
        continue
    
    if "=" not in stripped:
        fixed.append(line)
        continue
    
    key, val = stripped.split("=", 1)
    
    # If value is already quoted, keep as is
    if (val.startswith("'") and val.endswith("'")) or (val.startswith('"') and val.endswith('"')):
        fixed.append(line)
        continue
    
    # Check if value has spaces, commas, or special chars
    needs_quote = any(c in val for c in [" ", ",", "&", "→", "(", ")", "|", ";"])
    
    if needs_quote:
        fixed.append(f"{key}='{val}'\n")
    else:
        fixed.append(line)

with open("/home/ubuntu/portfolio/01-portfolio-laravel/.env", "w") as f:
    f.writelines(fixed)

print("Fixed all lines")
# Show what we fixed
for line in fixed:
    s = line.strip()
    if s and not s.startswith("#"):
        print(repr(s))
