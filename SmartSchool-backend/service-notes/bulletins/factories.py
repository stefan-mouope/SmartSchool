# factories.py
from .models import Bulletin, LigneBulletin
from notes.models import Note
from .services import moyenne_generale, moyenne_classe, rang_eleve

class BulletinFactory:
    @staticmethod
    def creer_bulletin(inscription_id, classe_id, trimestre=None, sequence=None):
        """
        Crée un bulletin avec ses lignes automatiquement à partir des notes.
        """
        # Création ou récupération du bulletin
        bulletin, created = Bulletin.objects.get_or_create(
            inscription_id=inscription_id,
            classe_id=classe_id,
            trimestre=trimestre if not sequence else None,
            sequence=sequence if sequence else None
        )

        # Calcul des moyennes et du rang
        if sequence:
            bulletin.moyenne_generale = moyenne_generale(inscription_id, sequence=sequence)
            bulletin.moyenne_classe = moyenne_classe(classe_id, sequence=sequence)
            bulletin.rang = rang_eleve(inscription_id, classe_id, sequence=sequence)
        else:
            trimestre = int(trimestre or 1)
            bulletin.moyenne_generale = moyenne_generale(inscription_id, trimestre=trimestre)
            bulletin.moyenne_classe = moyenne_classe(classe_id, trimestre=trimestre)
            bulletin.rang = rang_eleve(inscription_id, classe_id, trimestre=trimestre)

        bulletin.save()

        # Création des lignes de bulletin
        notes = Note.objects.filter(id_inscription=inscription_id)
        bulletin.lignes.all().delete()

        for note in notes:
            if trimestre == 1:
                seq_fields = ["sequence1", "sequence2"]
            elif trimestre == 2:
                seq_fields = ["sequence3", "sequence4"]
            elif trimestre == 3:
                seq_fields = ["sequence5", "sequence6"]
            else:
                seq_fields = []

            sequences = {f: getattr(note, f) for f in seq_fields}
            valeurs = [v for v in sequences.values() if v is not None]
            moy_trimestre = sum(valeurs)/len(valeurs) if valeurs else None

            appreciation = BulletinFactory._appreciation(moy_trimestre)

            LigneBulletin.objects.create(
                bulletin=bulletin,
                matiere=f"Matiere {note.id_matiere}",
                moyenne=moy_trimestre or 0.0,
                appreciation=appreciation,
                sequences=sequences
            )

        return bulletin, created

    @staticmethod
    def _appreciation(moyenne):
        if moyenne is None:
            return "Aucune note"
        if moyenne >= 16:
            return "Très bien"
        if moyenne >= 14:
            return "Bien"
        if moyenne >= 12:
            return "Assez bien"
        if moyenne >= 10:
            return "Passable"
        return "Insuffisant"
