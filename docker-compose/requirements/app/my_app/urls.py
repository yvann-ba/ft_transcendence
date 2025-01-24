from django.urls import path
from . import views

urlpatterns = [
    path('', views.game_page, name='home'),  # Page d'accueil
    path('api/users/', views.users_list, name='users_list'),
    path('api/games/', views.games_list, name='games_list'),
    path('<str:page>/', views.game_page, name='game_page'),  # Autres pages sans préfixe 'game'
]
