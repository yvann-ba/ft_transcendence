from django.shortcuts import render
from .models import Game, User

def game_page(request, page=None):
    if not page:
        page = 'home'

    # Exemple d'utilisation des modèles
    games = Game.objects.all()
    users = User.objects.all()

    return render(request, f'{page}.html', {'games': games, 'users': users})
