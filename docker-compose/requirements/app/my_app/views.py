# views.py
from django.shortcuts import render
from .models import Game, User

def game_page(request, page='home'):  # 'home' est la valeur par défaut
    # Récupération des données
    games = Game.objects.all()
    users = User.objects.all()

    # Assurez-vous que le template existe avant de le rendre
    valid_pages = ['home', 'profile', 'settings', 'pong-game', 'about']  # Liste des pages valides
    if page not in valid_pages:
        page = '404' 

    return render(request, f'{page}.html', {'games': games, 'users': users})
