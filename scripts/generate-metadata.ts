import { Prisma } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

async function generate() {
  const dmmf = Prisma.dmmf;

  if (!dmmf || !dmmf.datamodel) {
      console.error("Prisma DMMF not found. Ensure Prisma Client is generated.");
      process.exit(1);
  }

  const models = dmmf.datamodel.models.map(model => ({
    name: model.name,
    fields: model.fields.map(field => ({
      name: field.name,
      type: field.type,
      kind: field.kind, // scalar, object, enum
      isId: field.isId,
      isUnique: field.isUnique,
      isRequired: field.isRequired,
      isList: field.isList,
      relationName: field.relationName,
      relationFromFields: field.relationFromFields,
      relationToFields: field.relationToFields,
      hasDefaultValue: field.hasDefaultValue,
      default: field.default,
    }))
  }));

  const outputPath = path.join(process.cwd(), 'src/lib/prisma-metadata.json');
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, JSON.stringify({ models }, null, 2));
  console.log('Metadata generated at src/lib/prisma-metadata.json');
}

generate().catch(console.error);
