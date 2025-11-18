from django.urls import path
from .views import (
    CreateNote,
    UpdateNote,
    NotesByInscriptionByMatiere,
    NotesByMatiere,
    
)
from .views import notes_par_inscription

urlpatterns = [
    # CREATE
    path("create/<int:id_inscription>/<int:id_matiere>/", CreateNote.as_view()),

    # UPDATE
    path("update/<int:id_inscription>/<int:id_matiere>/", UpdateNote.as_view()),

    # GET by inscription by matiere
    path("inscription/<int:id_inscription>/<int:id_matiere>/", NotesByInscriptionByMatiere.as_view()),

    # GET by matiere
    path("matiere/<int:id_matiere>/", NotesByMatiere.as_view()),
    path("notesGenerales/<int:id_inscription>/", notes_par_inscription)
]
