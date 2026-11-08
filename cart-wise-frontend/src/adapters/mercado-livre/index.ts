import { createStoreAdapter } from "@/adapters/shared/create-store-adapter";
import { isVariantSelectionMissing } from "@/adapters/shared/variant-check";

export const mercadoLivreAdapter = createStoreAdapter({
  id: "mercado-livre",
  domain: "mercadolivre.com.br",
  variantRequiredCheck: isVariantSelectionMissing,
});
