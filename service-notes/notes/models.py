from django.db import models

# Create your models here.

class Note(models.Model):
    id_inscription = models.IntegerField()
    id_matiere = models.IntegerField()
    id_enseignant = models.IntegerField()

    # 6 séquences
    sequence1 = models.FloatField(null=True, blank=True)
    sequence2 = models.FloatField(null=True, blank=True)
    sequence3 = models.FloatField(null=True, blank=True)
    sequence4 = models.FloatField(null=True, blank=True)
    sequence5 = models.FloatField(null=True, blank=True)
    sequence6 = models.FloatField(null=True, blank=True)

    # 3 trimestres
    # trimestre1 = models.FloatField(null=True, blank=True)
    # trimestre2 = models.FloatField(null=True, blank=True)
    # trimestre3 = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ("id_inscription", "id_matiere")

    def __str__(self):
        return f"[Inscription={self.id_inscription}] Matiere={self.id_matiere}"
