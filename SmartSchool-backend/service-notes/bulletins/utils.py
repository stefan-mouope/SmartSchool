from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO
from django.http import HttpResponse

def exporter_bulletin_pdf(bulletin):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, height - 50, "Bulletin scolaire")
    p.setFont("Helvetica", 12)
    p.drawString(50, height - 80, f"Inscription: {bulletin.inscription}")
    p.drawString(50, height - 100, f"Trimestre: {bulletin.trimestre}")
    p.drawString(50, height - 120, f"Moyenne générale: {bulletin.moyenne_generale or 'N/A'}")
    p.drawString(50, height - 140, f"Moyenne classe: {bulletin.moyenne_classe or 'N/A'}")
    p.drawString(50, height - 160, f"Rang: {bulletin.rang or 'N/A'}")

    y = height - 200
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Matière")
    p.drawString(350, y, "Moyenne")
    p.drawString(450, y, "Appréciation")
    y -= 20
    p.setFont("Helvetica", 11)
    for ligne in bulletin.lignes.all():
        if y < 60:
            p.showPage()
            y = height - 50
        p.drawString(50, y, str(ligne.matiere))
        p.drawString(350, y, str(round(ligne.moyenne, 2)) if ligne.moyenne is not None else "-")
        p.drawString(450, y, ligne.appreciation or "")
        y -= 18

    p.showPage()
    p.save()
    buffer.seek(0)
    return HttpResponse(buffer, content_type='application/pdf')
