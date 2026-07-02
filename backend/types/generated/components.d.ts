import type { Schema, Struct } from "@strapi/strapi";

export interface MarketingUseCase extends Struct.ComponentSchema {
  collectionName: "components_marketing_use_cases";
  info: {
    displayName: "Use Case";
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String;
  };
}

declare module "@strapi/strapi" {
  export module Public {
    export interface ComponentSchemas {
      "marketing.use-case": MarketingUseCase;
    }
  }
}
