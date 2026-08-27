import { mkdir, readFile, readdir, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { type EmailServiceConfig, EmailServiceProvider } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { got } from 'got';
import nodemailer from 'nodemailer';
import { z } from 'zod';

import { EnvSet } from '#src/env-set/index.js';

type RenderedEmail = {
  to: string;
  subject: string;
  content: string;
  contentType: 'text/html' | 'text/plain';
  replyTo?: string;
  sendFrom?: string;
};

type OutboxMessage = RenderedEmail & {
  id: string;
  createdAt: string;
  delivered: false;
};
const outboxMessageGuard: z.ZodType<OutboxMessage> = z.object({
  id: z.string(),
  to: z.string(),
  subject: z.string(),
  content: z.string(),
  contentType: z.enum(['text/html', 'text/plain']),
  replyTo: z.string().optional(),
  sendFrom: z.string().optional(),
  createdAt: z.string(),
  delivered: z.literal(false),
});

const outboxDirectory = () => path.resolve(EnvSet.values.selfHostedDataPath, 'outbox');

const assertMessageId = (id: string) => {
  if (!/^[\w-]+$/.test(id)) {
    throw new TypeError('Invalid outbox message ID.');
  }
};

const writeOutboxMessage = async (message: RenderedEmail): Promise<OutboxMessage> => {
  const directory = outboxDirectory();
  await mkdir(directory, { recursive: true });
  const record: OutboxMessage = {
    ...message,
    id: generateStandardId(),
    createdAt: new Date().toISOString(),
    delivered: false,
  };
  const target = path.join(directory, `${record.id}.json`);
  const temporary = `${target}.${generateStandardId(6)}.tmp`;
  await writeFile(temporary, JSON.stringify(record, undefined, 2), { mode: 0o600 });
  await rename(temporary, target);
  return record;
};

export const listOutboxMessages = async (): Promise<OutboxMessage[]> => {
  const directory = outboxDirectory();
  await mkdir(directory, { recursive: true });
  const directoryEntries = await readdir(directory);
  const filenames = directoryEntries.filter((name) => name.endsWith('.json'));
  const messages = await Promise.all(
    filenames.map(async (name) => {
      const content: unknown = JSON.parse(await readFile(path.join(directory, name), 'utf8'));
      return outboxMessageGuard.parse(content);
    })
  );
  return messages.toSorted((left, right) => right.createdAt.localeCompare(left.createdAt));
};

export const getOutboxMessage = async (id: string): Promise<OutboxMessage> => {
  assertMessageId(id);
  const content: unknown = JSON.parse(
    await readFile(path.join(outboxDirectory(), `${id}.json`), 'utf8')
  );
  return outboxMessageGuard.parse(content);
};

export const deleteOutboxMessage = async (id: string): Promise<void> => {
  assertMessageId(id);
  await unlink(path.join(outboxDirectory(), `${id}.json`));
};

export const sendSelfHostedEmail = async (
  config: EmailServiceConfig,
  message: RenderedEmail
): Promise<{ id?: string; delivered: boolean }> => {
  if (config.provider === EmailServiceProvider.LocalOutbox) {
    const stored = await writeOutboxMessage(message);
    return { id: stored.id, delivered: false };
  }

  if (config.provider === EmailServiceProvider.Smtp) {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.user ? { user: config.user, pass: config.password ?? '' } : undefined,
    });
    const result = await transporter.sendMail({
      to: message.to,
      from: message.sendFrom ?? { name: config.fromName, address: config.fromEmail },
      replyTo: message.replyTo ?? config.replyTo,
      subject: message.subject,
      [message.contentType === 'text/plain' ? 'text' : 'html']: message.content,
    });
    return { id: result.messageId, delivered: true };
  }

  if (config.provider === EmailServiceProvider.SendGrid) {
    const response = await got.post('https://api.sendgrid.com/v3/mail/send', {
      headers: { Authorization: `Bearer ${config.apiKey}` },
      json: {
        personalizations: [{ to: [{ email: message.to }] }],
        from: { email: config.fromEmail, name: config.fromName },
        reply_to: message.replyTo ? { email: message.replyTo } : undefined,
        subject: message.subject,
        content: [{ type: message.contentType, value: message.content }],
      },
    });
    const messageId = response.headers['x-message-id'];
    return {
      id: Array.isArray(messageId) ? messageId[0] : messageId,
      delivered: true,
    };
  }

  throw new Error(
    'The Cloudflare email provider requires its Cloud runtime binding and is unavailable in the local email process.'
  );
};
