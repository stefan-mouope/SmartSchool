import { Label } from "../ui/label";

export const FormField = ({ label, required, error, children, icon: Icon }) => (
  <div className="space-y-2">
    {label && (
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon size={20} className="text-muted-foreground" />
        </div>
      )}
      {children}
    </div>
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);
