from django.db import models
from django.contrib.auth.models import User


class Note(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notes',
        null=True,
        blank=True
    )

    body = models.TextField(null=True, blank=True)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.body[:69] if self.body else "Untitled Note"