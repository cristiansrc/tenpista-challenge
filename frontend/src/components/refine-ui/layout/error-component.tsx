import { useNavigation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export function ErrorComponent() {
  const { push } = useNavigation();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
      <AlertTriangle className="h-16 w-16 text-destructive" />
      <h1 className="text-2xl font-bold">Página no encontrada</h1>
      <p className="text-muted-foreground">La página que buscas no existe.</p>
      <Button onClick={() => push("/transactions")}>Volver al inicio</Button>
    </div>
  );
}
