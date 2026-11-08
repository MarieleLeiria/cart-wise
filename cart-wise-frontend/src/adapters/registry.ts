import { amazonComBrAdapter } from "@/adapters/amazon-com-br";
import { genericAdapter } from "@/adapters/generic";
import { magazineLuizaAdapter } from "@/adapters/magazine-luiza";
import { mercadoLivreAdapter } from "@/adapters/mercado-livre";
import { sheinAdapter } from "@/adapters/shein";
import { shopeeAdapter } from "@/adapters/shopee";
import type { StoreAdapter } from "@/adapters/types";

export const storeAdapters: StoreAdapter[] = [
  amazonComBrAdapter,
  magazineLuizaAdapter,
  sheinAdapter,
  shopeeAdapter,
  mercadoLivreAdapter,
  genericAdapter,
];
