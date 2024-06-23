# ISTO NÃO FUNCIONA MAS DEVERIA
# python3 seed.py
# Problema: importa coisa de flask dentro da camada de serviço e de acesso ao banco de dados

from app.services.auth_service import create_user

def seed():
    create_user("admin@gmail.com", "123456", "O Professor")
    create_user("aluno@gmail.com", "123456", "O Aluno")

if __name__ == "__main__":
    seed()
