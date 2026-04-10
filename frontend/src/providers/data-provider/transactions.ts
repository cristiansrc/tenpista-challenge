import type {
  BaseRecord,
  DataProvider,
  GetListParams,
  LogicalFilter,
} from "@refinedev/core";
import { getJsonAuthHeaders } from "./shared/auth";
import { handleJsonResponse } from "./shared/response";
import type { TransactionPage } from "@/types/transaction";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/v1/api";

export const transactionsDataProvider: DataProvider = {
  getApiUrl: () => API_URL,

  getList: async <TData extends BaseRecord = BaseRecord>(params: GetListParams) => {
    const { pagination, filters } = params;
    const queryParams = new URLSearchParams();

    // Paginación — Refine usa base-1, la API usa base-0
    const currentPage = pagination?.currentPage ?? 1;
    const pageSize = pagination?.pageSize ?? 10;
    queryParams.set("page", String(currentPage - 1));
    queryParams.set("size", String(pageSize));

    // Filtro por nombre de Tenpista (servidor)
    const nameFilter = filters?.find(
      (f): f is LogicalFilter => "field" in f && f.field === "tenpista_name"
    );
    if (nameFilter && "value" in nameFilter && nameFilter.value) {
      queryParams.set("tenpistaName", String(nameFilter.value));
    }

    // Filtro por comercio (servidor)
    const commerceFilter = filters?.find(
      (f): f is LogicalFilter => "field" in f && f.field === "commerce_name"
    );
    if (commerceFilter && "value" in commerceFilter && commerceFilter.value) {
      queryParams.set("commerceName", String(commerceFilter.value));
    }

    // Filtro por rango de fechas (servidor)
    const fromDateFilter = filters?.find(
      (f): f is LogicalFilter => "field" in f && f.field === "transaction_date_from"
    );
    if (fromDateFilter && "value" in fromDateFilter && fromDateFilter.value) {
      queryParams.set("fromDate", `${String(fromDateFilter.value)}T00:00:00Z`);
    }

    const toDateFilter = filters?.find(
      (f): f is LogicalFilter => "field" in f && f.field === "transaction_date_to"
    );
    if (toDateFilter && "value" in toDateFilter && toDateFilter.value) {
      queryParams.set("toDate", `${String(toDateFilter.value)}T23:59:59.999Z`);
    }

    const url = `${API_URL}/transactions?${queryParams.toString()}`;
    const response = await fetch(url, { headers: getJsonAuthHeaders() });
    const data: TransactionPage = await handleJsonResponse(response);

    return {
      data: data.content as unknown as TData[],
      total: data.total_elements,
    };
  },

  create: async ({ variables }) => {
    const response = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: getJsonAuthHeaders(),
      body: JSON.stringify(variables),
    });
    const data = await handleJsonResponse(response);
    return { data };
  },

  // Métodos requeridos por la interfaz DataProvider (no usados en este recurso)
  getOne: async ({ id }) => {
    const response = await fetch(`${API_URL}/transactions/${id}`, {
      headers: getJsonAuthHeaders(),
    });
    const data = await handleJsonResponse(response);
    return { data };
  },

  update: async () => {
    throw new Error("Actualizar transacciones no está soportado");
  },

  deleteOne: async () => {
    throw new Error("Eliminar transacciones no está soportado");
  },

  getMany: async ({ ids }) => {
    const results = await Promise.all(
      ids.map((id) =>
        fetch(`${API_URL}/transactions/${id}`, { headers: getJsonAuthHeaders() }).then(
          handleJsonResponse
        )
      )
    );
    return { data: results };
  },
};
