# views.py
from django.shortcuts import render
from django.http import JsonResponse
from .models import CustomUser, GameResult
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import CustomUser, GameResult
from .serializers import UserSerializer, GameResultSerializer

@api_view(['GET'])
def users_list(request):
    users = CustomUser.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def game_results(request):
    results = GameResult.objects.order_by('-score')[:10]
    serializer = GameResultSerializer(results, many=True)
    return Response(serializer.data)

def game_page(request, page='home'):  # 'home' est la valeur par défaut
    # Récupération des données
    games = GameResult.objects.all()
    users = CustomUser.objects.all()

    # Assurez-vous que le template existe avant de le rendre
    valid_pages = ['home', 'profile', 'settings', 'pong-game', 'about', 'test']  # Liste des pages valides
    if page not in valid_pages:
        page = '404' 

    return render(request, f'{page}.html', {'games': games, 'users': users})
