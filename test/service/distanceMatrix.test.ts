import nock from 'nock';
import { DistanceMatrixService } from '../../src/services/distanceMatrix';

describe('distance matrix API', () => {
    beforeAll(() => {
        process.env.GOOGLE_API_KEY = 'some_key';
    });

    it('returns delivery ETAs from multiple restaurants to a customer\'s location', async () => {

        nock('https://maps.googleapis.com')
            .get('/maps/api/distancematrix/json')
            .query({
                key: 'some_key',
                origins: 'origin1|origin2',
                destinations: 'destination1',
            }).reply(200, {
                rows: [
                    { elements: [{ duration: { text: '21 mins' }, status: 'OK' }] },
                    { elements: [{ duration: { text: '17 mins' }, status: 'OK' }] },
                ],
                status: 'OK',
            });

        const service = new DistanceMatrixService();
        const result = await service.getETAs(['origin1|origin2'], 'destination1');

        expect(result).toEqual(['21 mins', '17 mins']);
    });

    it('returns n/a if overall status of google response is not OK', async () => {
        nock('https://maps.googleapis.com')
            .get('/maps/api/distancematrix/json')
            .query({
                key: 'some_key',
                origins: 'not important|not important',
                destinations: 'not important',
            }).reply(200, {
                status: 'NOT OK',
            });

        const service = new DistanceMatrixService();
        const result = await service.getETAs(['not important', 'not important'], 'not important');

        expect(result).toEqual(['n/a', 'n/a']);
    });

    it('returns n/a for each unsuccessful destination', async () => {
        nock('https://maps.googleapis.com')
            .get('/maps/api/distancematrix/json')
            .query({
                key: 'some_key',
                origins: 'not important|not important',
                destinations: 'not important',
            }).reply(200, {
                rows: [
                    { elements: [{ duration: { text: '21 mins' }, status: 'OK' }] },
                    { elements: [{ duration: { text: '17 mins' }, status: 'NOT OK' }] },
                ],
                status: 'OK',
            });

        const service = new DistanceMatrixService();
        const result = await service.getETAs(['not important', 'not important'], 'not important');

        expect(result).toEqual(['21 mins', 'n/a']);
    });
});
