import express from 'express';

const router = express.Router();

// Juste un test pour voir si la route répond
router.get('/test', (req, res) => {
    res.json({ message: "La route Speaker fonctionne !" });
});

export default router;