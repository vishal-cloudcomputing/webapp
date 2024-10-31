import statsdClient from '../config/statsd';

const timeDatabaseQuery = async (dbOperation: () => Promise<any>, operationName: string): Promise<any> => {
    const startTime = Date.now();
    try {
        const result = await dbOperation();
        const duration = Date.now() - startTime;
        statsdClient.timing(`database.${operationName}.duration`, duration);
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        statsdClient.timing(`database.${operationName}.duration`, duration);
        throw error; 
    }
};

export default timeDatabaseQuery;
