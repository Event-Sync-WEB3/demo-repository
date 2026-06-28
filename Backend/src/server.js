import 'dotenv/config';
import app from './index.js';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});