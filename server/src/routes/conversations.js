import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/security.js';
import { forbidden, notFound } from '../lib/errors.js';
import { notify } from '../lib/notify.js';
import * as s from '../lib/schemas.js';
import * as out from '../lib/serialize.js';

// Customer ↔ provider messaging. Clients poll `GET /:id/messages?after=` for
// new messages; a websocket or SSE channel can replace polling later without
// changing the data model.

const router = Router();
router.use(requireAuth);

const include = {
  provider: { select: { id: true, name: true, categoryId: true, userId: true } },
  customer: { select: { id: true, name: true } },
  messages: { orderBy: { createdAt: 'desc' }, take: 1 },
};

/** Which side of the conversation the user is on, or null if neither. */
function sideOf(conv, user) {
  if (conv.customerId === user.id) return 'customer';
  if (conv.provider.userId === user.id) return 'provider';
  return null;
}

async function loadConversation(id, user) {
  const conv = await prisma.conversation.findUnique({ where: { id }, include });
  const side = conv && sideOf(conv, user);
  if (!side) throw notFound('Conversation');
  return { conv, side };
}

async function unreadCount(conv, side, viewerId) {
  const lastRead = side === 'customer' ? conv.customerLastReadAt : conv.providerLastReadAt;
  return prisma.message.count({
    where: { conversationId: conv.id, senderId: { not: viewerId }, ...(lastRead && { createdAt: { gt: lastRead } }) },
  });
}

async function serialize(conv, side, user) {
  const other = side === 'customer' ? { name: conv.provider.name, category: conv.provider.categoryId } : { name: conv.customer.name, category: null };
  const last = conv.messages[0];
  return {
    id: conv.id,
    artisanId: conv.providerId,
    participantName: other.name,
    participantCategory: other.category,
    as: side,
    unread: await unreadCount(conv, side, user.id),
    lastMessage: last ? out.message(last, user.id) : null,
    updatedAt: conv.lastMessageAt,
  };
}

router.get('/', async (req, res) => {
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ customerId: req.user.id }, { provider: { userId: req.user.id } }] },
    include,
    orderBy: { lastMessageAt: 'desc' },
    take: 100,
  });
  res.json({ conversations: await Promise.all(convs.map((c) => serialize(c, sideOf(c, req.user), req.user))) });
});

/** Opens (or returns the existing) conversation with a provider. */
router.post('/', validate({ body: z.object({ artisanId: s.id }) }), async (req, res) => {
  const provider = await prisma.provider.findFirst({ where: { id: req.valid.body.artisanId, listed: true } });
  if (!provider) throw notFound('Provider');
  if (provider.userId === req.user.id) throw forbidden('You can’t message your own listing.');
  const conv = await prisma.conversation.upsert({
    where: { customerId_providerId: { customerId: req.user.id, providerId: provider.id } },
    create: { customerId: req.user.id, providerId: provider.id },
    update: {},
    include,
  });
  res.status(201).json({ conversation: await serialize(conv, 'customer', req.user) });
});

const messagesQuery = z.object({
  after: z.iso.datetime().optional(),
  before: z.iso.datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

router.get('/:id/messages', validate({ params: s.idParams, query: messagesQuery }), async (req, res) => {
  const { conv } = await loadConversation(req.valid.params.id, req.user);
  const { after, before, limit } = req.valid.query;
  const rows = await prisma.message.findMany({
    where: {
      conversationId: conv.id,
      ...((after || before) && { createdAt: { ...(after && { gt: new Date(after) }), ...(before && { lt: new Date(before) }) } }),
    },
    orderBy: { createdAt: after ? 'asc' : 'desc' },
    take: limit,
  });
  const messages = (after ? rows : rows.reverse()).map((m) => out.message(m, req.user.id));
  res.json({ messages, hasMore: rows.length === limit });
});

router.post('/:id/messages', writeLimiter, validate({ params: s.idParams, body: z.object({ text: z.string().trim().min(1).max(2000) }) }), async (req, res) => {
  const { conv, side } = await loadConversation(req.valid.params.id, req.user);
  if (side === 'customer' && !conv.provider.userId) {
    // Seeded demo providers have no account, so nobody would ever read this.
    throw forbidden('This is a demo profile and can’t receive messages.');
  }
  const now = new Date();
  const message = await prisma.$transaction(async (tx) => {
    const m = await tx.message.create({ data: { conversationId: conv.id, senderId: req.user.id, body: req.valid.body.text } });
    await tx.conversation.update({
      where: { id: conv.id },
      data: { lastMessageAt: now, ...(side === 'customer' ? { customerLastReadAt: now } : { providerLastReadAt: now }) },
    });
    return m;
  });
  const recipient = side === 'customer' ? conv.provider.userId : conv.customerId;
  const senderName = side === 'customer' ? conv.customer.name : conv.provider.name;
  await notify(recipient, { type: 'message.new', title: `New message from ${senderName}`, body: message.body.slice(0, 140), link: `/messages?c=${conv.id}` });
  res.status(201).json({ message: out.message(message, req.user.id) });
});

router.post('/:id/read', validate({ params: s.idParams }), async (req, res) => {
  const { conv, side } = await loadConversation(req.valid.params.id, req.user);
  await prisma.conversation.update({
    where: { id: conv.id },
    data: side === 'customer' ? { customerLastReadAt: new Date() } : { providerLastReadAt: new Date() },
  });
  res.status(204).end();
});

export default router;
