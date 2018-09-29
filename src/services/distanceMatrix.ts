import axios from 'axios';

export interface IDistanceMatrixService {
    getETAs(origins: string[], destination: string): Promise<string[]>;
}

export class DistanceMatrixService implements IDistanceMatrixService {
    public async getETAs(origins: string[], destination: string) {
        const googleAPIKey = process.env.GOOGLE_API_KEY;

        try {
            const result = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
                params: {
                    origins: origins.join('|'),
                    destinations: destination,
                    key: googleAPIKey,
                },
            });

            if (result.data.status !== 'OK') {
                throw new Error('Google Distance Matrix response status is not OK');
            }

            return (result.data.rows as any[]).map(row => {
                const element = row.elements[0];
                return element.status !== 'OK' ? 'n/a' : element.duration.text;
            });

        } catch (error) {
            // tslint:disable-next-line:no-console
            console.log(error);
            return origins.map(_ => 'n/a');
        }
    }
}
