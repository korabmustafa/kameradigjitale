import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { createConnection, Socket } from 'node:net';
import { connect as createTlsConnection, TLSSocket } from 'node:tls';

type MailMessage = {
  to: string;
  subject: string;
  text: string;
};

type SmtpOptions = MailMessage & {
  host: string;
  port: number;
  secure: boolean;
  startTls: boolean;
  timeoutMs: number;
  username?: string;
  password?: string;
  from: string;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendMail(message: MailMessage) {
    const host = this.config.get<string>('SMTP_HOST');
    const from = this.config.get<string>('SMTP_FROM') ?? 'orders@kameradigjitale.local';

    if (!host) {
      this.logger.warn(`SMTP_HOST is not configured. Email preview for ${message.to}: ${message.subject}\n${message.text}`);
      return;
    }

    const port = this.numberConfig('SMTP_PORT', 465);
    const secure = this.booleanConfig('SMTP_SECURE', port === 465);

    await this.sendSmtp({
      ...message,
      host,
      from,
      port,
      secure,
      startTls: !secure && this.booleanConfig('SMTP_STARTTLS', port === 587),
      timeoutMs: this.numberConfig('SMTP_TIMEOUT_MS', 10000),
      username: this.config.get<string>('SMTP_USER'),
      password: this.config.get<string>('SMTP_PASS')
    });
  }

  async sendOrderConfirmation(order: {
    orderNumber: string;
    customerName: string;
    email: string;
    total: unknown;
    status: string;
  }) {
    const lookupUrl = this.orderLookupUrl(order.orderNumber);

    await this.sendMail({
      to: order.email,
      subject: `Your Kameradigjitale order ${order.orderNumber}`,
      text: [
        `Hi ${order.customerName},`,
        '',
        'Thanks for your order with Kameradigjitale.',
        `Your order number is ${order.orderNumber}.`,
        `Current status: ${order.status}.`,
        `Total: $${order.total}.`,
        '',
        lookupUrl
          ? `Check the latest status here: ${lookupUrl}`
          : 'Use your order number and email address on the order lookup page to check the latest status.',
        '',
        'Kameradigjitale'
      ].join('\n')
    });
  }

  private sendSmtp(options: SmtpOptions) {
    return new Promise<void>((resolve, reject) => {
      let socket: Socket | TLSSocket = options.secure
        ? createTlsConnection({ host: options.host, port: options.port, servername: options.host })
        : createConnection({ host: options.host, port: options.port });
      let buffer = '';
      let pendingResponse: ((response: string) => void) | null = null;
      let rejected = false;

      const fail = (error: Error) => {
        if (!rejected) {
          rejected = true;
          socket.destroy();
          reject(error);
        }
      };
      const completeResponsePattern = /(?:^|\r?\n)\d{3} /;
      const flushResponse = () => {
        if (pendingResponse && completeResponsePattern.test(buffer)) {
          const response = buffer;
          buffer = '';
          const resolveResponse = pendingResponse;
          pendingResponse = null;
          resolveResponse(response);
        }
      };
      const attachSocketHandlers = () => {
        socket.setTimeout(options.timeoutMs, () => fail(new Error(`SMTP connection timed out after ${options.timeoutMs}ms`)));
        socket.on('data', (chunk: Buffer) => {
          buffer += chunk.toString('utf8');
          flushResponse();
        });
        socket.once('error', fail);
      };
      const read = () =>
        new Promise<string>((readResolve) => {
          pendingResponse = readResolve;
          flushResponse();
        });
      const expect = async (...codes: string[]) => {
        const response = await read();
        if (!codes.some((code) => response.startsWith(code))) {
          throw new Error(`SMTP command failed: ${response.trim()}`);
        }
        return response;
      };
      const send = (command: string) => socket.write(`${command}\r\n`);
      const escapeBody = (value: string) => value.replace(/\r?\n/g, '\r\n').replace(/^\./gm, '..');
      const sanitizeHeader = (value: string) => value.replace(/[\r\n]/g, ' ');
      const formatAddress = (value: string) => `<${value.replace(/[<>]/g, '')}>`;

      attachSocketHandlers();
      socket.once(options.secure ? 'secureConnect' : 'connect', async () => {
        try {
          await expect('220');
          send(`EHLO ${options.host}`);
          await expect('250');

          if (options.startTls) {
            send('STARTTLS');
            await expect('220');
            socket.removeAllListeners('data');
            socket.removeAllListeners('error');
            socket.removeAllListeners('timeout');
            buffer = '';
            socket = createTlsConnection({ socket, servername: options.host });
            attachSocketHandlers();
            await new Promise<void>((tlsResolve) => socket.once('secureConnect', tlsResolve));
            send(`EHLO ${options.host}`);
            await expect('250');
          }

          if (options.username && options.password) {
            send('AUTH LOGIN');
            await expect('334');
            send(Buffer.from(options.username).toString('base64'));
            await expect('334');
            send(Buffer.from(options.password).toString('base64'));
            await expect('235');
          }

          send(`MAIL FROM:${formatAddress(options.from)}`);
          await expect('250');
          send(`RCPT TO:${formatAddress(options.to)}`);
          await expect('250', '251');
          send('DATA');
          await expect('354');
          socket.write(
            [
              `From: ${sanitizeHeader(options.from)}`,
              `To: ${sanitizeHeader(options.to)}`,
              `Subject: ${sanitizeHeader(options.subject)}`,
              `Message-ID: <${randomUUID()}@kameradigjitale.local>`,
              'MIME-Version: 1.0',
              'Content-Type: text/plain; charset=utf-8',
              '',
              escapeBody(options.text),
              '.'
            ].join('\r\n') + '\r\n'
          );
          await expect('250');
          send('QUIT');
          socket.end();
          resolve();
        } catch (error) {
          fail(error instanceof Error ? error : new Error('SMTP delivery failed'));
        }
      });
    });
  }

  private numberConfig(key: string, fallback: number) {
    const value = Number(this.config.get<string>(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private booleanConfig(key: string, fallback: boolean) {
    const value = this.config.get<string>(key);
    if (value === undefined) return fallback;
    return value === 'true';
  }

  private orderLookupUrl(orderNumber: string) {
    const configured = this.config.get<string>('ORDER_LOOKUP_URL') ?? this.config.get<string>('FRONTEND_URL');
    if (!configured) return undefined;

    const url = new URL(configured);
    if (!url.pathname || url.pathname === '/') url.pathname = '/order-lookup';
    url.searchParams.set('orderNumber', orderNumber);
    return url.toString();
  }
}
