import React, { useState, useMemo } from 'react';
import { FileText, Search, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { eleves, classes } from '@/constants/mockData';

type GenerationType = 'annee' | 'classe' | 'eleve';

export const BulletinsPage: React.FC = () => {
  const [generationType, setGenerationType] = useState<GenerationType>('classe');
  const [selectedClasse, setSelectedClasse] = useState('CM2 A');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Génération des Bulletins</h2>

      <div className="bg-card rounded-lg shadow-sm border p-6">
        {/* Type de génération */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-3">
            Type de génération
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setGenerationType('annee')}
              className={`px-4 py-2 rounded-md transition-colors ${
                generationType === 'annee'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Par année scolaire
            </button>
            <button
              onClick={() => setGenerationType('classe')}
              className={`px-4 py-2 rounded-md transition-colors ${
                generationType === 'classe'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Par classe
            </button>
            <button
              onClick={() => setGenerationType('eleve')}
              className={`px-4 py-2 rounded-md transition-colors ${
                generationType === 'eleve'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Pour un élève
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Année scolaire
            </label>
            <select className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
              <option>2024-2025</option>
              <option>2023-2024</option>
              <option>2022-2023</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Trimestre
            </label>
            <select className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground">
              <option>Trimestre 1</option>
              <option>Trimestre 2</option>
              <option>Trimestre 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Classe
            </label>
            <select 
              className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              disabled={generationType === 'annee'}
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
            >
              {classes.map(classe => (
                <option key={classe.id} value={classe.nom}>{classe.nom}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description selon le type */}
        <div className="bg-muted/30 border border-border rounded-md p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            {generationType === 'annee' && (
              <>
                <strong>Génération par année :</strong> Tous les bulletins de toutes les classes pour l'année scolaire sélectionnée seront générés.
              </>
            )}
            {generationType === 'classe' && (
              <>
                <strong>Génération par classe :</strong> Les bulletins de tous les élèves de la classe sélectionnée seront générés pour le trimestre choisi.
              </>
            )}
            {generationType === 'eleve' && (
              <>
                <strong>Génération individuelle :</strong> Le bulletin de l'élève sélectionné sera généré pour le trimestre choisi.
              </>
            )}
          </p>
        </div>

        {/* Boutons d'action pour Par classe */}
        {generationType === 'classe' && (
          <div className="flex gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <FileText className="w-4 h-4 mr-2" />
              Générer les bulletins (PDF)
            </Button>
          </div>
        )}

        {/* Génération par année */}
        {generationType === 'annee' && (
          <div className="flex gap-3">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <FileText className="w-4 h-4 mr-2" />
              Générer tous les bulletins de l'année
            </Button>
          </div>
        )}

        {/* Liste des élèves pour génération individuelle */}
        {generationType === 'eleve' && (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Sélectionner un élève
              </h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Rechercher un élève..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Nom de l'élève</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Classe</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Statut paiement</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {eleves
                    .filter(eleve => 
                      eleve.nom.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((eleve) => (
                      <tr key={eleve.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm text-foreground">{eleve.nom}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{eleve.classe}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              eleve.statut === 'Payé'
                                ? 'bg-stats-green/10 text-stats-green'
                                : eleve.statut === 'Partiel'
                                ? 'bg-stats-orange/10 text-stats-orange'
                                : 'bg-stats-red/10 text-stats-red'
                            }`}
                          >
                            {eleve.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="sm"
                            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => {
                              // Logique de génération du bulletin
                              console.log('Générer bulletin pour', eleve.nom);
                            }}
                          >
                            <Printer className="w-4 h-4" />
                            Générer bulletin
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              
              {eleves.filter(eleve => 
                eleve.nom.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  Aucun élève trouvé
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
