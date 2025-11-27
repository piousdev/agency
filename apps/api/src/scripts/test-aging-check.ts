import 'dotenv/config';
import { runAgingCheck } from '../lib/intake-notifications';

async function main() {
  console.log('Starting manual aging check...');
  try {
    await runAgingCheck();
    console.log('Manual aging check completed successfully.');
  } catch (error) {
    console.error('Manual aging check failed:', error);
  }
  process.exit(0);
}

void main();
