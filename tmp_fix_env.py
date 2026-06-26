import sys

with open("/home/ubuntu/portfolio/.env", "r") as f:
    content = f.read()

replacements = [
    ('MAIL_FROM_NAME="Baye Mor Gaye"', "MAIL_FROM_NAME='Baye Mor Gaye'"),
    ('MAIL_FROM_NAME=Baye Mor Gaye', "MAIL_FROM_NAME='Baye Mor Gaye'"),
    ('PROPRIETAIRE_NOM=Baye Mor Gaye', "PROPRIETAIRE_NOM='Baye Mor Gaye'"),
    ('NEXT_PUBLIC_OWNER_NOM=Baye Mor Gaye', "NEXT_PUBLIC_OWNER_NOM='Baye Mor Gaye'"),
    ('NEXT_PUBLIC_OWNER_TITRE=AI & Software Engineer', "NEXT_PUBLIC_OWNER_TITRE='AI & Software Engineer'"),
    ('PROPRIETAIRE_TITRE=AI & Software Engineer', "PROPRIETAIRE_TITRE='AI & Software Engineer'"),
]

for old, new in replacements:
    content = content.replace(old, new)

with open("/home/ubuntu/portfolio/01-portfolio-laravel/.env", "w") as f:
    f.write(content)

print("Fixed")
