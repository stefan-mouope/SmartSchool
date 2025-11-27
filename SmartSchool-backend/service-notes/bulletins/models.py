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
    bulletin = models.ForeignKey('Bulletin', related_name='lignes', on_delete=models.CASCADE)
    matiere = models.CharField(max_length=150)  # Nom complet de la matière
    moyenne = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    appreciation = models.CharField(max_length=100, blank=True)
    sequences = models.JSONField(default=dict, blank=True)  # ← CE CHAMP EST CRUCIAL !

    class Meta:
        verbose_name = "Ligne de bulletin"
        verbose_name_plural = "Lignes de bulletin"

    def __str__(self):
        return f"{self.matiere} - {self.moyenne or '-'}"
