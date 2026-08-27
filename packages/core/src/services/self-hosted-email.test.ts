import { EmailServiceProvider } from '@logto/schemas';
import nock from 'nock';

import { sendSelfHostedEmail } from './self-hosted-email.js';

describe('self-hosted email service', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('delivers rendered content through SendGrid without requiring a hosted template', async () => {
    const sendGrid = nock('https://api.sendgrid.com', {
      reqheaders: { authorization: 'Bearer sendgrid-secret' },
    })
      .post('/v3/mail/send', (body) => {
        expect(body).toMatchObject({
          personalizations: [{ to: [{ email: 'user@example.com' }] }],
          subject: 'Verify your email',
          content: [{ type: 'text/html', value: '<strong>123456</strong>' }],
        });
        return true;
      })
      .reply(202, undefined, { 'x-message-id': 'sendgrid-message' });

    await expect(
      sendSelfHostedEmail(
        {
          provider: EmailServiceProvider.SendGrid,
          apiKey: 'sendgrid-secret',
          fromName: 'Example',
          fromEmail: 'hello@example.com',
        },
        {
          to: 'user@example.com',
          subject: 'Verify your email',
          content: '<strong>123456</strong>',
          contentType: 'text/html',
        }
      )
    ).resolves.toEqual({ id: 'sendgrid-message', delivered: true });
    expect(sendGrid.isDone()).toBe(true);
  });
});
