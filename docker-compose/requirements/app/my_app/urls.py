from django.urls import path
from . import views

urlpatterns = [
<<<<<<< HEAD
    path('', views.game_page, name='home'),
    path('api/users/', views.users_list, name='users_list'),
    path('api/game-results/', views.game_results, name='game_results'),
    path('<str:page>/', views.game_page, name='game_page'),
]
=======
    path('', views.game_page, name='home'),  # Page d'accueil
    path('<str:page>/', views.game_page, name='game_page'),  # Autres pages sans préfixe 'game'
]
>>>>>>> origin/main
