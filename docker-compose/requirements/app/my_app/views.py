# views.py
from django.shortcuts import render
from django.http import JsonResponse
from .models import Game, User

def users_list(request):
    users = list(User.objects.values())
    return JsonResponse(users, safe=False)

def games_list(request):
    games = list(Game.objects.values())
    return JsonResponse(games, safe=False)

def game_page(request, page='home'):  # 'home' est la valeur par défaut
    # Récupération des données
    games = Game.objects.all()
    users = User.objects.all()

    # Assurez-vous que le template existe avant de le rendre
    valid_pages = ['home', 'profile', 'settings', 'pong-game', 'about', 'test']  # Liste des pages valides
    if page not in valid_pages:
        page = '404' 

    return render(request, f'{page}.html', {'games': games, 'users': users})
