import pg from 'pg';
const { Client } = pg;

export class GraphService {
    private client: pg.Client;

    constructor() {
        this.client = new Client({
            connectionString: process.env.DATABASE_URL,
        });
    }

    async connect() {
        await this.client.connect();
        try {
            // Initialize Apache Age
            await this.client.query('LOAD "age"');
            await this.client.query('SET search_path = ag_catalog, "$user", public');
        } catch (error) {
            console.error('Failed to initialize Apache Age. Ensure the extension is installed.', error);
            throw error;
        }
    }

    async query(cypher: string, graphName: string = 'curriculum') {
        // This is a helper for simple cypher queries
        // Adjust as needed for specific return types
        const sql = `SELECT * FROM cypher('${graphName}', $$ ${cypher} $$) as (v agtype)`;
        return this.client.query(sql);
    }

    async close() {
        await this.client.end();
    }
}

export const graphService = new GraphService();
