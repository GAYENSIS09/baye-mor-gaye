with open("/home/ubuntu/portfolio/01-portfolio-laravel/.env", "r") as f:
    content = f.read()

content = content.replace(
    "MAIL_PASSWORD=xdri zktj ovsi lzhl",
    "MAIL_PASSWORD='xdri zktj ovsi lzhl'"
)

with open("/home/ubuntu/portfolio/01-portfolio-laravel/.env", "w") as f:
    f.write(content)

print("Fixed MAIL_PASSWORD")

# Verify
with open("/home/ubuntu/portfolio/01-portfolio-laravel/.env", "r") as f:
    for line in f:
        if "MAIL_PASSWORD" in line or "MAIL_FROM_NAME" in line or "PROPRIETAIRE_BIO" in line:
            print(repr(line.rstrip()))
