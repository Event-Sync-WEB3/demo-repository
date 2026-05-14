import express from 'express';

const router = express.Router();

router.get('/test', (req, res) => {
    res.json({ message: "La route Speaker fonctionne !" });
});

export default router;