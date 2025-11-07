import MastraServer from './mastra/server';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

console.log(`Starting SummarizeBot on ${HOST}:${PORT}...`);

MastraServer.startMastra().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default MastraServer;
