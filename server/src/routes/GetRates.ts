import { Request, Response, Router } from 'express';
import DBController from '../DBController.js';
import Parser from '../Parser.js';

type CacheObj = {
    base_currency: string;
    targets: string;
    data: string;
}

export const getRates = Router();
getRates.get('/api/rates', async (req: Request, res: Response) => {
    const { base } = req.query;
    const targets: unknown = req.query.targets || '';
    console.log('targets: ', targets);

    const targetArray: string[] = String(targets).split(',').filter((currency) => currency.trim() !== '');

    if (!base) {
        return res.status(400).json({ error: 'Параметр base обязателен' });
    }

    if (targetArray.length === 0) {
        console.log('Targets is empty, returning base structure: ', targetArray);
        return res.json({
            base: base,
            target: [],
        });
    }

    try {
        const sortedTargets: string = targetArray.sort().join(',');
        const cacheData: CacheObj | null = await DBController.getRatesCache({
            base_currency: String(base),
            targets: sortedTargets,
        });
        if (cacheData !== null) {
            console.log('cacheData is not null:\n', cacheData.data);
            res.send(cacheData.data);
            return;
        }
        console.log('cacheData is null');

        const data = await Parser.getRates(String(base), targetArray.sort());

        if (data) {
            console.log('Данные из get api/rates: ', data);
            await DBController.upsertRatesCache({
                base_currency: String(base),
                targets: sortedTargets,
                data: JSON.stringify(data),
            });
            res.send(data);
        } else {
            res.status(404).json({
                error: 'Не удалось найти данные для указанных валют',
            });
        }
    } catch (e) {
        console.error('Error in /api/rates:', e);
        res.status(500).json({ error: 'Не удалось получить курсы' });
    }
});
