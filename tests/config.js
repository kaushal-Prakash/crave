import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env');
const content = fs.readFileSync(envPath, 'utf8');

content.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && trimmed.includes('=')) {
    const [key, val] = trimmed.split('=');
    process.env[key] = val;
  }
});

console.log("Loaded ENV:", process.env.NEXT_PUBLIC_FRONTEND_URL);
