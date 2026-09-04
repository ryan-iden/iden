import { EnvSet } from '#src/env-set/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);

const { assembleSwaggerDocument, buildManagementApiBaseDocument, getSupplementDocuments } =
  await import('../swagger/utils/documents.js');

it('keeps trusted-device OpenAPI when dev features are enabled', async () => {
  const documents = await getSupplementDocuments('admin-user');
  const baseDocument = buildManagementApiBaseDocument(new Map(), new Set(), 'https://logto.test');

  const document = assembleSwaggerDocument(
    documents,
    baseDocument,
    createContextWithRouteParameters()
  );
  expect(JSON.stringify(document)).toContain('/api/users/{userId}/trusted-devices');
  expect(baseDocument.components?.parameters).toHaveProperty('trustedDeviceId');
  expect(baseDocument.components?.parameters).toHaveProperty('trustedDeviceId-root');
});
