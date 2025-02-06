from rest_framework import serializers
from .models import CustomUser, GameResult

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'avatar', 'total_score']

class GameResultSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = GameResult
        fields = ['user', 'score', 'duration', 'created_at']