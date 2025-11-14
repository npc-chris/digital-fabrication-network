import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { db } from './database';
import { messages, notifications } from '../models/schema';
import { eq } from 'drizzle-orm';

export const initializeWebSocket = (server: HTTPServer) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    console.log(`User ${userId} connected`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content, subject } = data;

        // Save message to database
        const [newMessage] = await db
          .insert(messages)
          .values({
            senderId: userId,
            receiverId,
            content,
            subject: subject || null,
          })
          .returning();

        // Emit to receiver
        io.to(`user:${receiverId}`).emit('new_message', newMessage);

        // Create notification for receiver
        await db.insert(notifications).values({
          userId: receiverId,
          type: 'message',
          title: 'New Message',
          message: `You have a new message from user ${userId}`,
          relatedType: 'message',
          relatedId: newMessage.id,
        });

        // Emit notification to receiver
        io.to(`user:${receiverId}`).emit('new_notification', {
          type: 'message',
          title: 'New Message',
          message: `You have a new message from user ${userId}`,
        });

        // Confirm to sender
        socket.emit('message_sent', { success: true, message: newMessage });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Mark message as read
    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId } = data;
        // Update message in database
        await db
          .update(messages)
          .set({ isRead: true })
          .where(eq(messages.id, messageId));

        socket.emit('message_read_confirmed', { messageId });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { receiverId } = data;
      io.to(`user:${receiverId}`).emit('user_typing', { userId });
    });

    socket.on('stop_typing', (data) => {
      const { receiverId } = data;
      io.to(`user:${receiverId}`).emit('user_stop_typing', { userId });
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });

  return io;
};
