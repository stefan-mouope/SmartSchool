// LevelsTranchesTable.tsx
import React from "react";

interface LevelTrancheItem {
  level: number;
  tranches: Record<string, number>;
}

interface LevelsTranchesTableProps {
  data: LevelTrancheItem[];
}

export const LevelsTranchesTable: React.FC<LevelsTranchesTableProps> = ({ data }) => {
  return (
    <div className="mt-6 p-6 bg-card rounded-xl shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Niveaux & Tranches</h3>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted text-left">
            <th className="p-3">Niveau</th>
            <th className="p-3">Tranches</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b border-border">
              <td className="p-3 font-semibold">{item.level}</td>
              <td className="p-3">
                <div className="space-y-2">
                  {Object.entries(item.tranches).map(([name, amount]) => (
                    <div key={name} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{name}</span>
                      <span className="font-medium">{amount} XOF</span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};