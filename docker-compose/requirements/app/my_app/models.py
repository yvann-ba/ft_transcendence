from django.db import models

class User(models.Model):
    name = models.CharField(max_length=100)
    # Ajoutez d'autres champs si nécessaire

class Game(models.Model):
    name = models.CharField(max_length=100)
    # Ajoutez d'autres champs si nécessaire
