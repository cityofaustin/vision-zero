from flask import g

def get_user_email():
    current_user = getattr(g, "current_user", None)
    return current_user["https://hasura.io/jwt/claims"]["x-hasura-user-email"]
