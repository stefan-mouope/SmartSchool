from notes.models import Note

def get_inscriptions_classe(classe_id):
    """
    Retourne une liste d'IDs d'inscriptions pour la classe.
    Ici simulé, tu dois appeler l'API du service Inscription.
    """
    # Exemple : [1, 2, 3, 4, 5]
    return [1, 2, 3, 4, 5]  # IDs fictifs pour les tests

# --- CALCULS DE MOYENNES ---
def moyenne_matiere(inscription_id, matiere_id, trimestre=None, sequence=None):
    """
    Calcule la moyenne d'une matière pour un élève pour un trimestre ou une séquence.
    """
    try:
        note = Note.objects.get(id_inscription=inscription_id, id_matiere=matiere_id)
    except Note.DoesNotExist:
        return None

    if sequence:
        seq_field = f"sequence{sequence}"
        return getattr(note, seq_field, None)

    # Map trimestre -> séquences correspondantes
    map_trimestre = {
        1: ("sequence1", "sequence2"),
        2: ("sequence3", "sequence4"),
        3: ("sequence5", "sequence6"),
    }

    seq_fields = map_trimestre.get(int(trimestre), ())
    valeurs = [getattr(note, f, None) for f in seq_fields if getattr(note, f, None) is not None]

    if not valeurs:
        return None
    return sum(valeurs) / len(valeurs)


def moyenne_generale(inscription_id, trimestre=None, sequence=None):
    notes = Note.objects.filter(id_inscription=inscription_id)
    if not notes.exists():
        return None

    total = 0.0
    count = 0
    for note in notes:
        moy = moyenne_matiere(inscription_id, note.id_matiere, trimestre, sequence)
        if moy is not None:
            total += moy
            count += 1

    if count == 0:
        return None
    return total / count


def moyenne_classe(classe_id, trimestre=None, sequence=None):
    inscription_ids = get_inscriptions_classe(classe_id)
    moys = []
    for ins_id in inscription_ids:
        mg = moyenne_generale(ins_id, trimestre, sequence)
        if mg is not None:
            moys.append(mg)

    if not moys:
        return None
    return sum(moys) / len(moys)


def rang_eleve(inscription_id, classe_id, trimestre=None, sequence=None):
    inscription_ids = get_inscriptions_classe(classe_id)
    pairs = []
    for ins_id in inscription_ids:
        mg = moyenne_generale(ins_id, trimestre, sequence)
        if mg is not None:
            pairs.append((ins_id, mg))

    pairs.sort(key=lambda x: x[1], reverse=True)
    for idx, (ins_id, mg) in enumerate(pairs, start=1):
        if ins_id == inscription_id:
            return idx
    return None
