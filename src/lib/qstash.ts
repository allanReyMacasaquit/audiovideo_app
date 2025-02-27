// Using the workflow client
import { Client } from '@upstash/workflow';

export const QStashClient = new Client({ token: process.env.QSTASH_TOKEN! });
