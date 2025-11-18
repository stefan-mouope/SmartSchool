from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Bulletin, LigneBulletin
from .serializers import BulletinSerializer, LigneBulletinSerializer
from .services import moyenne_generale, moyenne_classe, rang_eleve, moyenne_matiere
from notes.models import Note

# ViewSets basiques
class BulletinViewSet(viewsets.ModelViewSet):
    queryset = Bulletin.objects.all()
    serializer_class = BulletinSerializer

class LigneBulletinViewSet(viewsets.ModelViewSet):
    queryset = LigneBulletin.objects.all()
    serializer_class = LigneBulletinSerializer


@api_view(['POST'])
def api_generer_bulletin(request):
    """
    body JSON:
    {
      "inscription_id": 12,
      "classe_id": 5,        # obligatoire pour calculer moyenne de classe et rang
      "trimestre": 1,        # optionnel si sequence fourni
      "sequence": 2          # optionnel
    }
    """
    inscription_id = request.data.get('inscription_id')
    classe_id = request.data.get('classe_id')
    trimestre = request.data.get('trimestre')
    sequence = request.data.get('sequence')

    if not inscription_id or not classe_id:
        return Response({"error": "inscription_id et classe_id requis"}, status=400)

    # Calcul des moyennes
    if sequence:
        mg = moyenne_generale(inscription_id, sequence=sequence)
        mc = moyenne_classe(classe_id, sequence=sequence)
        rang = rang_eleve(inscription_id, classe_id, sequence=sequence)
    else:
        trimestre = int(trimestre or 1)
        mg = moyenne_generale(inscription_id, trimestre=trimestre)
        mc = moyenne_classe(classe_id, trimestre=trimestre)
        rang = rang_eleve(inscription_id, classe_id, trimestre=trimestre)

    # Création du bulletin
    bulletin, created = Bulletin.objects.get_or_create(
        inscription_id=inscription_id,
        classe_id=classe_id,
        trimestre=trimestre if not sequence else None,
        sequence=sequence if sequence else None
    )
    bulletin.moyenne_generale = mg
    bulletin.moyenne_classe = mc
    bulletin.rang = rang
    bulletin.save()

    # Création des lignes par matière (simulées à partir des notes existantes)
    notes = Note.objects.filter(id_inscription=inscription_id)
    bulletin.lignes.all().delete()

    for note in notes:
    # Déterminer les séquences correspondant au trimestre
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
        appreciation = _appreciation(moy_trimestre)

        LigneBulletin.objects.create(
            bulletin=bulletin,
            matiere=f"Matiere {note.id_matiere}",
            moyenne=moy_trimestre or 0.0,
            appreciation=appreciation,
            sequences=sequences  # si tu veux retourner ça dans le serializer
        )


    serializer = BulletinSerializer(bulletin)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else 200)


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


# Export PDF endpoint
from .utils import exporter_bulletin_pdf
@api_view(['GET'])
def api_exporter_bulletin_pdf(request, bulletin_id):
    bulletin = Bulletin.objects.get(id=bulletin_id)
    return exporter_bulletin_pdf(bulletin)
