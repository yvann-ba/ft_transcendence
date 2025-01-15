from django.urls import path
from . import views

urlpatterns = [
    path('', views.game_page, name='home'),  # Page d'accueil
    path('<str:page>/', views.game_page, name='game_page'),  # Autres pages sans préfixe 'game'
]
