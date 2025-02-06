from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
	avatar = models.URLField(blank=True, null=True)
	total_score = models.IntegerField(default=0)
	
class GameResult(models.Model):
	user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
	score = models.IntegerField()
	duration = models.DurationField()
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self):
		return f"{self.user.username} - {self.score}"