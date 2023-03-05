/**
 * Created by Abhishek on 12/02/2023.
 */

 const bunyan = require('bunyan');
 
 const log = bunyan.createLogger({
   // eslint-disable-next-line no-inline-comments
   name: 'gasless-service', // Required
   // eslint-disable-next-line no-inline-comments
   level: 'info', // Optional, see "Levels" section
   // stream: process.stdout,           // Optional, see "Streams" section
   streams: [
     {
       level: (process.env.NODE_ENV === 'production') ? 'debug' : 'debug',
       stream: process.stdout,
     },
   ],
   serializers: {
     req: bunyan.stdSerializers.req,
     err: bunyan.stdSerializers.err,
   },
 });
 
 module.exports = log;
 