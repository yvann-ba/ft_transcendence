from . import views
from django.urls import path

urlpatterns = [
    path('', views.ma_vue, name='ma_vue'),
	path('nouvelle-page/', views.nouvelle_page, name='nouvelle_page'),
]