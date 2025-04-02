from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Todo(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='todos')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
