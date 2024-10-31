import { StatsD } from 'node-statsd';

const statsdClient = new StatsD({
  host: 'localhost', 
  port: 8125,   
  prefix: 'webapp.',     
});

export default statsdClient;
