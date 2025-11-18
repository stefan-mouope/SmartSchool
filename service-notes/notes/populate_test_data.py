# notes/populate_test_data.py
import random
from notes.models import Note

def run():
    # Supprimer les anciennes données
    Note.objects.all().delete()

    # Création de 5 inscriptions fictives (id_inscription = 1..5)
    inscriptions = list(range(1, 6))

    # Création de 5 matières fictives (id_matiere = 101..105)
    matieres = list(range(101, 106))

    # Création de 5 enseignants fictifs (id_enseignant = 1..5)
    enseignants = list(range(1, 6))

    # Génération aléatoire de notes
    for ins_id in inscriptions:
        for mat_id in matieres:
            Note.objects.create(
                id_inscription=ins_id,
                id_matiere=mat_id,
                id_enseignant=random.choice(enseignants),
                sequence1=random.randint(5, 20),
                sequence2=random.randint(5, 20),
                sequence3=random.randint(5, 20),
                sequence4=random.randint(5, 20),
                sequence5=random.randint(5, 20),
                sequence6=random.randint(5, 20),
                trimestre1=None,
                trimestre2=None,
                trimestre3=None
            )
    print("Données fictives créées avec succès !")

# Pour exécuter depuis Django shell :
# >>> from notes.populate_test_data import run
# >>> run()
