import metadata from './prisma-metadata.json';

export type FieldMetadata = {
  name: string;
  type: string | object; 
  kind: string;
  isId: boolean;
  isUnique: boolean;
  isRequired: boolean;
  isList: boolean;
  relationName?: string | null;
  relationFromFields?: string[];
  relationToFields?: string[];
  hasDefaultValue: boolean;
  default?: any;
};

export type ModelMetadata = {
  name: string;
  fields: FieldMetadata[];
};

export type SchemaMetadata = {
  models: ModelMetadata[];
};

export async function getSchemaMetadata(): Promise<SchemaMetadata> {
  return metadata as unknown as SchemaMetadata;
}
