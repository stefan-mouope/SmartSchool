// src/components/BulletinTemplate.tsx
import React from 'react';
import { getSchoolById } from '@/api/registration-service/school.api';
import { useAuthStore } from '@/store/authStore';

interface BulletinLine {
  id: number;
  matiere: string;
  moyenne: number | null;
  sequence1_note?: number | null;
  sequence2_note?: number | null;
  coefficient?: number | string;
  appreciation: string;
}

interface BulletinTemplateProps {
  studentName: string;
  matricule: string;
  classe: string;
  anneeScolaire: string;
  periodeLabel: string;
  lignes: BulletinLine[];
  moyenneGenerale: number | null;
  moyenneClasse: number | null;
  rang: string | null;
  trimestre?: number | null;
  sequence?: number | null;
}

export const BulletinTemplate: React.FC<BulletinTemplateProps> = ({
  studentName,
  matricule,
  classe,
  anneeScolaire,
  periodeLabel,
  lignes,
  moyenneGenerale,
  moyenneClasse,
  rang,
  trimestre,
  sequence
}) => {
  // Déterminer la mention
  const getMention = (moyenne: number | null) => {
    if (moyenne == null) return '-';
    if (moyenne >= 16) return 'Très Bien';
    if (moyenne >= 14) return 'Bien';
    if (moyenne >= 12) return 'Assez Bien';
    if (moyenne >= 10) return 'Passable';
    return 'Insuffisant';
  };

  const [school, setSchool] = React.useState<any>(null);
  const school_id = useAuthStore(state => state.school_id);

  const handleGetSchool = async (school_id: number) => {
    try {
      const school = await getSchoolById(school_id);
      setSchool(school);
      console.log(school)
      return school;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'école :', error);
      return null;
    }
  };

  React.useEffect(() => {
  
    handleGetSchool(school_id);
  }, []);

  // Calculer les moyennes des séquences pour le trimestre
  const calculerMoyenneSequence = (sequenceNum: 1 | 2) => {
    const prop = sequenceNum === 1 ? 'sequence1_note' : 'sequence2_note';
    const notesValides = lignes
      .filter(l => l[prop] != null)
      .map(l => {
        const val = l[prop];
        return typeof val === 'number' ? val : Number(val);
      })
      .filter(n => !isNaN(n));
    
    if (notesValides.length === 0) return null;
    return notesValides.reduce((sum, note) => sum + note, 0) / notesValides.length;
  };

  const moyenneSeq1 = trimestre != null ? calculerMoyenneSequence(1) : null;
  const moyenneSeq2 = trimestre != null ? calculerMoyenneSequence(2) : null;

  return (
    <div style={{
      fontFamily: "'Times New Roman', serif",
      backgroundColor: 'white',
      padding: '30px',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* En-tête */}
      <div style={{
        border: '2px solid #000',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: '20px',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          {/* Section gauche (français) */}
          <div style={{
            textAlign: 'left',
            fontSize: '11px',
            lineHeight: '1.6'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>
              REPUBLIQUE DU CAMEROUN
            </div>
            <div style={{ fontStyle: 'italic', marginBottom: '10px' }}>
              Paix – Travail – Patrie
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>
              {school ? school.name.toUpperCase() : ''  }
            </div>
            <div style={{ fontStyle: 'italic', color: '#444' }}>
              {school ? school.devise : '' }
            </div>
          </div>

          {/* Logo central */}
          <div
          style={{
            width: '100px',
            height: '100px',
            border: '2px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
            borderRadius: '50%',
            overflow: 'hidden',           // IMPORTANT pour couper ce qui dépasse
          }}
        >
          <img
            src={school?.logo}
            alt="Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',         // Remplit sans déformer
              borderRadius: '50%',        // Rend l’image elle-même circulaire
            }}
          />
        </div>

          {/* Section droite (anglais) */}
          <div style={{
            textAlign: 'right',
            fontSize: '11px',
            lineHeight: '1.6'
          }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' }}>
              REPUBLIC OF CAMEROON
            </div>
            <div style={{ fontStyle: 'italic', marginBottom: '10px' }}>
              Peace – Work – Fatherland
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '5px' }}>
              {school ? school.name_en.toUpperCase() : '' }
            </div>
            <div style={{ fontStyle: 'italic', color: '#444' }}>
              {school ? school.devise_en : '' }
            </div>
          </div>
        </div>
      </div>

      {/* Informations élève */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '15px',
        padding: '15px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px', minWidth: '120px' }}>
            Nom de l'élève :
          </span>
          <span style={{
            flex: 1,
            padding: '5px 10px',
            backgroundColor: 'white',
            border: '1px solid #ccc'
          }}>
            {studentName}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px', minWidth: '120px' }}>
            Classe :
          </span>
          <span style={{
            flex: 1,
            padding: '5px 10px',
            backgroundColor: 'white',
            border: '1px solid #ccc'
          }}>
            {classe}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px', minWidth: '120px' }}>
            Matricule :
          </span>
          <span style={{
            flex: 1,
            padding: '5px 10px',
            backgroundColor: 'white',
            border: '1px solid #ccc'
          }}>
            {matricule}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px', minWidth: '120px' }}>
            Année scolaire :
          </span>
          <span style={{
            flex: 1,
            padding: '5px 10px',
            backgroundColor: 'white',
            border: '1px solid #ccc'
          }}>
            {anneeScolaire}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gridColumn: 'span 2' }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px', minWidth: '120px' }}>
            Période :
          </span>
          <span style={{
            flex: 1,
            padding: '5px 10px',
            backgroundColor: 'white',
            border: '1px solid #ccc'
          }}>
            {periodeLabel}
          </span>
        </div>
      </div>

      {/* Tableau des notes */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px'
      }}>
        <thead>
          <tr>
            <th rowSpan={2} style={{
              backgroundColor: '#2c3e50',
              color: 'white',
              padding: '12px',
              textAlign: 'center',
              fontWeight: 'bold',
              border: '1px solid #000'
            }}>MATIÈRES</th>
            {trimestre != null ? (
              <>
                <th colSpan={2} style={{
                  backgroundColor: '#2c3e50',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  border: '1px solid #000'
                }}>NOTES /20</th>
                <th rowSpan={2} style={{
                  backgroundColor: '#2c3e50',
                  color: 'white',
                  padding: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  border: '1px solid #000'
                }}>MOY. TRIM.</th>
              </>
            ) : (
              <th rowSpan={2} style={{
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '12px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '1px solid #000'
              }}>NOTE /20</th>
            )}
            <th rowSpan={2} style={{
              backgroundColor: '#2c3e50',
              color: 'white',
              padding: '12px',
              textAlign: 'center',
              fontWeight: 'bold',
              border: '1px solid #000'
            }}>APPRÉCIATION</th>
          </tr>
          {trimestre != null && (
            <tr>
              <th style={{
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '12px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '1px solid #000'
              }}>SEQ. {trimestre * 2 - 1}</th>
              <th style={{
                backgroundColor: '#2c3e50',
                color: 'white',
                padding: '12px',
                textAlign: 'center',
                fontWeight: 'bold',
                border: '1px solid #000'
              }}>SEQ. {trimestre * 2}</th>
            </tr>
          )}
        </thead>
        <tbody>
          {lignes.map((ligne, index) => {
            // Convertir en nombre pour éviter les erreurs
            const moyenneNum = ligne.moyenne != null ? Number(ligne.moyenne) : null;
            const seq1Num = ligne.sequence1_note != null ? Number(ligne.sequence1_note) : null;
            const seq2Num = ligne.sequence2_note != null ? Number(ligne.sequence2_note) : null;
            
            return (
              <tr key={ligne.id} style={{
                backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'
              }}>
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  textAlign: 'left',
                  paddingLeft: '15px',
                  fontWeight: 500
                }}>
                  {ligne.matiere}
                </td>
                {trimestre != null ? (
                  <>
                    {/* Note Séquence 1 */}
                    <td style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      {seq1Num != null && !isNaN(seq1Num) ? seq1Num.toFixed(2) : '-'}
                    </td>
                    {/* Note Séquence 2 */}
                    <td style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      textAlign: 'center',
                      fontWeight: 'bold'
                    }}>
                      {seq2Num != null && !isNaN(seq2Num) ? seq2Num.toFixed(2) : '-'}
                    </td>
                    {/* Moyenne Trimestre */}
                    <td style={{
                      padding: '10px',
                      border: '1px solid #ddd',
                      textAlign: 'center',
                      fontWeight: 'bold',
                      backgroundColor: '#e8f4f8'
                    }}>
                      {moyenneNum != null && !isNaN(moyenneNum) ? moyenneNum.toFixed(2) : '-'}
                    </td>
                  </>
                ) : (
                  /* Note Séquence simple */
                  <td style={{
                    padding: '10px',
                    border: '1px solid #ddd',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    {moyenneNum != null && !isNaN(moyenneNum) ? moyenneNum.toFixed(2) : '-'}
                  </td>
                )}
                {/* Appréciation */}
                <td style={{
                  padding: '10px',
                  border: '1px solid #ddd',
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}>
                  {ligne.appreciation}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Résultats finaux */}
      {trimestre != null ? (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{
              border: '2px solid #2c3e50',
              padding: '15px',
              textAlign: 'center',
              backgroundColor: '#ecf0f1'
            }}>
              <div style={{
                fontWeight: 'bold',
                fontSize: '12px',
                marginBottom: '8px',
                color: '#2c3e50',
                textTransform: 'uppercase'
              }}>Moyenne Séquence {trimestre * 2 - 1}</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#e74c3c'
              }}>
                {moyenneSeq1 != null ? `${moyenneSeq1.toFixed(2)}/20` : '-/20'}
              </div>
            </div>
            <div style={{
              border: '2px solid #2c3e50',
              padding: '15px',
              textAlign: 'center',
              backgroundColor: '#ecf0f1'
            }}>
              <div style={{
                fontWeight: 'bold',
                fontSize: '12px',
                marginBottom: '8px',
                color: '#2c3e50',
                textTransform: 'uppercase'
              }}>Moyenne Séquence {trimestre * 2}</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#e74c3c'
              }}>
                {moyenneSeq2 != null ? `${moyenneSeq2.toFixed(2)}/20` : '-/20'}
              </div>
            </div>
            <div style={{
              border: '2px solid #2c3e50',
              padding: '15px',
              textAlign: 'center',
              backgroundColor: '#ecf0f1'
            }}>
              <div style={{
                fontWeight: 'bold',
                fontSize: '12px',
                marginBottom: '8px',
                color: '#2c3e50',
                textTransform: 'uppercase'
              }}>Moyenne Trimestre</div>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#e74c3c'
              }}>
                {moyenneClasse != null ? `${moyenneClasse.toFixed(2)}/20` : '-/20'}
              </div>
            </div>
          </div>
        </>
      ) : null}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        marginTop: '15px'
      }}>
        {trimestre == null && (
          <div style={{
            border: '2px solid #2c3e50',
            padding: '15px',
            textAlign: 'center',
            backgroundColor: '#ecf0f1'
          }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: '12px',
              marginBottom: '8px',
              color: '#2c3e50',
              textTransform: 'uppercase'
            }}>Moyenne de l'élève</div>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#e74c3c'
            }}>
              {moyenneGenerale != null ? `${moyenneGenerale.toFixed(2)}/20` : '-/20'}
            </div>
          </div>
        )}
        <div style={{
          border: '2px solid #2c3e50',
          padding: '15px',
          textAlign: 'center',
          backgroundColor: '#ecf0f1'
        }}>
          <div style={{
            fontWeight: 'bold',
            fontSize: '12px',
            marginBottom: '8px',
            color: '#2c3e50',
            textTransform: 'uppercase'
          }}>Moyenne de la classe</div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#e74c3c'
          }}>
            {moyenneClasse != null ? `${moyenneClasse.toFixed(2)}/20` : '-/20'}
          </div>
        </div>
        <div style={{
          border: '2px solid #2c3e50',
          padding: '15px',
          textAlign: 'center',
          backgroundColor: '#ecf0f1'
        }}>
          <div style={{
            fontWeight: 'bold',
            fontSize: '12px',
            marginBottom: '8px',
            color: '#2c3e50',
            textTransform: 'uppercase'
          }}>Rang</div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#e74c3c'
          }}>{rang || '-'}</div>
        </div>
        <div style={{
          border: '2px solid #2c3e50',
          padding: '15px',
          textAlign: 'center',
          backgroundColor: '#ecf0f1'
        }}>
          <div style={{
            fontWeight: 'bold',
            fontSize: '12px',
            marginBottom: '8px',
            color: '#2c3e50',
            textTransform: 'uppercase'
          }}>Mention</div>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#e74c3c'
          }}>{getMention(moyenneGenerale)}</div>
        </div>
      </div>

      {/* Signatures */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid #ddd'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '30px',
            textDecoration: 'underline'
          }}>Le Directeur</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '30px',
            textDecoration: 'underline'
          }}>Le Titulaire</div>
        </div>
      </div>
    </div>
  );
};