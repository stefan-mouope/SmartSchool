import React from 'react';

// Composant Skeleton de base
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-muted rounded ${className}`} />
);

// Skeleton pour une ligne de tableau
export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="hover:bg-muted/50">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-6 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
    <td className="px-6 py-4">
      <div className="flex items-center justify-center gap-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </td>
  </tr>
);

// Skeleton pour le tableau complet
export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-muted">
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index} className="px-6 py-3">
              <Skeleton className="h-4 w-24" />
            </th>
          ))}
          <th className="px-6 py-3">
            <Skeleton className="h-4 w-20 mx-auto" />
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, index) => (
          <TableRowSkeleton key={index} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// Skeleton pour les cartes (si besoin)
export const CardSkeleton = () => (
  <div className="bg-card rounded-lg shadow-md p-6">
    <Skeleton className="h-6 w-48 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

// Skeleton pour un formulaire (si besoin)
export const FormSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div>
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  </div>
);

// Export par défaut du TableSkeleton
export default TableSkeleton;