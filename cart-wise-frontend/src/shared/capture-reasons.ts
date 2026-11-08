export const captureReasons = [
  "currency_unknown",
  "no_image",
  "variant_not_selected",
  "price_not_found",
  "name_not_found",
  "adapter_error",
  "invalid_payload",
  "storage_error",
  "not_implemented",
] as const;

export type CaptureReason = (typeof captureReasons)[number];

export const captureReasonLabels: Record<CaptureReason, string> = {
  currency_unknown: "Não foi possível identificar a moeda deste produto.",
  no_image: "Não encontramos uma imagem do produto.",
  variant_not_selected: "Selecione cor, tamanho ou outra opção do produto antes de salvar.",
  price_not_found: "Não encontramos o preço deste produto.",
  name_not_found: "Não encontramos o nome deste produto.",
  adapter_error: "Não foi possível ler esta página.",
  invalid_payload: "Os dados capturados são inválidos.",
  storage_error: "Não foi possível salvar o produto neste navegador.",
  not_implemented: "Captura ainda não disponível nesta versão.",
};
