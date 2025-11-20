from django.db import models
from django.utils import timezone
class Bulletin(models.Model):
    inscription_id = models.IntegerField()
    classe_id = models.IntegerField(null=True, blank=True)   
    trimestre = models.IntegerField(null=True, blank=True)
    moyenne_generale = models.FloatField(null=True, blank=True)
    sequence = models.IntegerField(null=True, blank=True) 
    moyenne_classe = models.FloatField(null=True, blank=True)
    rang = models.IntegerField(null=True, blank=True)
    date_creation = models.DateTimeField(default=timezone.now)

class LigneBulletin(models.Model):
    bulletin = models.ForeignKey(Bulletin, on_delete=models.CASCADE, related_name='lignes')
    matiere = models.CharField(max_length=255)
    moyenne = models.FloatField(null=True, blank=True)
    appreciation = models.CharField(max_length=255, blank=True, default='')
    sequences = models.JSONField(null=True, blank=True)
