import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
  id: int('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  password: text('password').notNull(),
  role: text('role').notNull(),
});

export const logsTable = sqliteTable('logs', {
  id: int('id').primaryKey({ autoIncrement: true }),
  userId: text('userId').notNull(),
  action: text('action').notNull(),
  excelFile: text('excelFile').notNull(),
  pdfFile: text('pdfFile').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  timestamp: text('timestamp').notNull(),
});

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Log = typeof logsTable.$inferSelect;
export type NewLog = typeof logsTable.$inferInsert;

