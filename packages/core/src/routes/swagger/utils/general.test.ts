import { type OpenAPIV3 } from 'openapi-types';

import { EnvSet } from '#src/env-set/index.js';
import { type DeepPartial } from '#src/test-utils/tenant.js';

import {
  devFeatureSchemaExtension,
  removeDevFeatureSchemaProperties,
  removeUnnecessaryOperations,
  selfHostedOnlyExtension,
  selfHostedParitySchemaExtension,
} from './general.js';

const originalIsCloud = EnvSet.values.isCloud;
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
const originalIsSelfHostedParityEnabled = EnvSet.values.isSelfHostedParityEnabled;

const setDevFeaturesEnabled = (isDevFeaturesEnabled: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Tests need to cover both dev-feature states.
  (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = isDevFeaturesEnabled;
};

const setSelfHostedParityEnabled = (isSelfHostedParityEnabled: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Tests cover both parity states.
  (EnvSet.values as { isSelfHostedParityEnabled: boolean }).isSelfHostedParityEnabled =
    isSelfHostedParityEnabled;
};

const createDevFeatureBooleanSchema = () =>
  ({
    type: 'boolean',
    [devFeatureSchemaExtension]: true,
  }) satisfies OpenAPIV3.SchemaObject & Record<typeof devFeatureSchemaExtension, true>;

const createDocument = (): DeepPartial<OpenAPIV3.Document> => ({
  openapi: '3.0.1',
  info: {
    title: 'Test',
    version: '1.0.0',
  },
  paths: {
    '/api/mock': {
      patch: {
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'beta'],
                properties: {
                  name: {
                    type: 'string',
                  },
                  beta: createDevFeatureBooleanSchema(),
                },
              },
            },
          },
        },
      },
    },
  },
});

const createDevFeatureOperationDocument = (): DeepPartial<OpenAPIV3.Document> => ({
  openapi: '3.0.1',
  info: {
    title: 'Test',
    version: '1.0.0',
  },
  paths: {
    '/api/stable': {
      get: {
        tags: ['Stable'],
      },
    },
    '/api/dev': {
      get: {
        tags: ['Dev feature'],
      },
    },
    '/api/parity': {
      get: {
        tags: ['Dev feature', 'Self-hosted parity'],
      },
    },
  },
});

const createSelfHostedDocument = () =>
  ({
    [selfHostedOnlyExtension]: true,
    paths: { '/api/self-hosted': { get: { tags: ['Self-hosted parity'] } } },
  }) as unknown as DeepPartial<OpenAPIV3.Document>;

describe('swagger general utils', () => {
  afterEach(() => {
    Reflect.set(EnvSet.values, 'isCloud', originalIsCloud);
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
    setSelfHostedParityEnabled(originalIsSelfHostedParityEnabled);
  });

  it('should remove dev feature schema properties when dev features are disabled', () => {
    setDevFeaturesEnabled(false);

    const document = createDocument();
    removeDevFeatureSchemaProperties(document);

    expect(document).toMatchObject({
      paths: {
        '/api/mock': {
          patch: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    required: ['name'],
                    properties: {
                      name: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    expect(JSON.stringify(document)).not.toContain('beta');
    expect(JSON.stringify(document)).not.toContain(devFeatureSchemaExtension);
  });

  it('should keep dev feature schema properties without exposing the internal marker when dev features are enabled', () => {
    setDevFeaturesEnabled(true);

    const document = createDocument();
    removeDevFeatureSchemaProperties(document);

    expect(document).toMatchObject({
      paths: {
        '/api/mock': {
          patch: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    required: ['name', 'beta'],
                    properties: {
                      beta: {
                        type: 'boolean',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    expect(JSON.stringify(document)).not.toContain(devFeatureSchemaExtension);
  });

  it('should remove dev feature operations when dev features are disabled', () => {
    Reflect.set(EnvSet.values, 'isCloud', true);
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);

    const document = removeUnnecessaryOperations(createDevFeatureOperationDocument());

    expect(document.paths).toMatchObject({
      '/api/stable': {
        get: {
          tags: ['Stable'],
        },
      },
    });
    expect(document.paths).not.toHaveProperty('/api/dev');
    expect(document.paths).not.toHaveProperty('/api/parity');
  });

  it('should expose only explicitly tagged parity operations when parity is enabled', () => {
    Reflect.set(EnvSet.values, 'isCloud', false);
    setDevFeaturesEnabled(false);
    setSelfHostedParityEnabled(true);

    const document = removeUnnecessaryOperations(createDevFeatureOperationDocument());

    expect(document.paths).toHaveProperty('/api/stable');
    expect(document.paths).not.toHaveProperty('/api/dev');
    expect(document.paths).toHaveProperty('/api/parity');
  });

  it('exposes self-hosted-only documents only when self-hosted parity is enabled', () => {
    Reflect.set(EnvSet.values, 'isCloud', true);
    setSelfHostedParityEnabled(true);
    expect(removeUnnecessaryOperations(createSelfHostedDocument()).paths).toEqual({});

    Reflect.set(EnvSet.values, 'isCloud', false);
    expect(removeUnnecessaryOperations(createSelfHostedDocument()).paths).toHaveProperty(
      '/api/self-hosted'
    );
  });

  it('should prune parity schema properties when parity is disabled', () => {
    Reflect.set(EnvSet.values, 'isCloud', false);
    setSelfHostedParityEnabled(false);
    const document = {
      paths: {
        '/api/mock': {
          patch: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      parity: {
                        type: 'boolean',
                        [selfHostedParitySchemaExtension]: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    } as unknown as DeepPartial<OpenAPIV3.Document>;

    removeDevFeatureSchemaProperties(document);

    expect(JSON.stringify(document)).not.toContain('parity');
  });

  it('should prune self-hosted-only schema properties in Cloud', () => {
    Reflect.set(EnvSet.values, 'isCloud', true);
    setSelfHostedParityEnabled(true);
    const document = {
      paths: {
        '/api/mock': {
          get: {
            responses: {
              200: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        organizationCenter: {
                          type: 'object',
                          [selfHostedOnlyExtension]: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    } as unknown as DeepPartial<OpenAPIV3.Document>;

    removeDevFeatureSchemaProperties(document);

    expect(JSON.stringify(document)).not.toContain('organizationCenter');
  });
});
