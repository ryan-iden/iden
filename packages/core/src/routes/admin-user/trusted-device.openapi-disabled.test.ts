import { EnvSet } from '#src/env-set/index.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

const { assembleSwaggerDocument, buildManagementApiBaseDocument, getSupplementDocuments } =
  await import('../swagger/utils/documents.js');

it('filters trusted-device OpenAPI when dev features are disabled', async () => {
  const documents = await getSupplementDocuments('admin-user');
  const baseDocument = buildManagementApiBaseDocument(new Map(), new Set(), 'https://logto.test');

  const document = assembleSwaggerDocument(
    documents,
    baseDocument,
    createContextWithRouteParameters()
  );
  expect(JSON.stringify(document)).not.toContain('/api/users/{userId}/trusted-devices');
  expect(baseDocument.components?.parameters).not.toHaveProperty('trustedDeviceId');
  expect(baseDocument.components?.parameters).not.toHaveProperty('trustedDeviceId-root');
});
