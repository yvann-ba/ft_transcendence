from django.urls import path
from . import views

urlpatterns = [
    path('', views.game_page, name='home'),
    path('pong/', views.game_page, name='home'),
    path('pong/<str:page>/', views.game_page, name='game_page'),  # Route avec paramètre page
]
