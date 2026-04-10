import { useCreate } from "@refinedev/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const transactionSchema = z.object({
  amount: z
    .number({ invalid_type_error: "El monto debe ser un número" })
    .int("El monto debe ser un número entero")
    .min(1, "El monto debe ser mayor a 0"),
  commerce_name: z
    .string()
    .min(1, "El comercio es requerido")
    .max(255, "Máximo 255 caracteres"),
  tenpista_name: z
    .string()
    .min(1, "El nombre del Tenpista es requerido")
    .max(255, "Máximo 255 caracteres"),
  transaction_date: z
    .string()
    .min(1, "La fecha es requerida")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, "Fecha inválida")
    .refine((val) => {
      return new Date(val) <= new Date();
    }, "La fecha no puede ser futura"),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
}

export function TransactionForm({ open, onClose }: TransactionFormProps) {
  const { mutate: create, mutation } = useCreate();
  const isPending = mutation.isPending;

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: undefined,
      commerce_name: "",
      tenpista_name: "",
      transaction_date: "",
    },
  });

  const onSubmit = (values: TransactionFormValues) => {
    // Convertir la fecha local a ISO 8601 con offset
    const date = new Date(values.transaction_date);
    const isoDate = date.toISOString();

    create(
      {
        resource: "transactions",
        values: { ...values, transaction_date: isoDate },
      },
      {
        onSuccess: () => {
          form.reset();
          onClose();
        },
        onError: (error) => {
          // El error se maneja via notificationProvider (sonner)
          console.error("Error al crear transacción:", error);
        },
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Transacción</DialogTitle>
          <DialogDescription>
            Completa los campos para registrar una nueva transacción.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Monto */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto (CLP)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="5000"
                      min={1}
                      disabled={isPending}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comercio */}
            <FormField
              control={form.control}
              name="commerce_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comercio</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Starbucks"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nombre Tenpista */}
            <FormField
              control={form.control}
              name="tenpista_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Tenpista</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cristian"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Fecha de Transacción */}
            <FormField
              control={form.control}
              name="transaction_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha y hora</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      disabled={isPending}
                      max={new Date().toISOString().slice(0, 16)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Registrar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
