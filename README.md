# Prometheus metrics example
This is based on a tutorial by TomDoesTech at [Measure your ExpressJS API performance with Prometheus](https://www.youtube.com/watch?v=HMQ-h3riqYU).

We try to creae a metrics endpoint that can be scraped by a Prometheus server and it can then be displayed with something like a Grafana to see the response times of queries or send an alert if there's a memory leak or any other issues.

## Approach
___

### Setup
___
1. First clone over the [Rest API with ui example](https://github.com/deepnair/restapiwithui).
1. cd to both the server and then the ui one by one and run yarn on both to install dependencies.
1. Copy back the config folder which was left out of the server folder and copy back the .env.local to the ui folder.
1. cd to the server folder and yarn add response-time and prom-client.
1. Then yarn add @types/response-time -D for the typescript types.

### metrics.ts
___
1. Create a metrics.ts file in the utils folder in the server folder.
1. In the metrics.ts there will be a function called startMetricsServer. This will take in app of type Express from 'express'.
1. This function is to be export defaulted.
1. In the function app.listen to metricsPort from the default.ts in config. Also log a message saying that the metrics server is listening at this port. In real world deployment, this won't be an open port but rather something that is limited to VPC or something so that these metrics are not available from a public endpoint.
1. Above the app.listen within the function, create an app.route('/metrics'). In a get method have an async function where you res.set the 'Content-Type' to client.register.contentType where client is imported from 'prom-client'. Then return res.send await client.register.metrics(). Note, if you don't return it or await the client.register.metrics(), it won't work as expected.
1. Above both these statements create a const collectDefaultMetrics which is equal to client.collectDefaultMetrics. Then execute this as collectDefaultMetrics().
1. Finally above the function create a restAPIResponseTimeHistogram and a dbResponseTimeHistogram where both are a new client.Histogram. Both take name and help property, however the rest API one has labelNames of ['method', 'route', and 'status_code'] whereas the db one has labelNames of ['operation' and 'success'].
1. Both these histogram variables are exported.

### server.ts
___

1. In the server.ts utility, we import and execute startMetricsServer with app as input.
1. Then above routes(app) in the file we app.use responseTime from 'response-time' as middleware.
1. The responseTime takes a callback function where the inputs are a req, res, and time. req and res are of types Request and Response from 'express'. time is a number.
1. Within the function if(req?.route?.path) then restAPIResponseTimeHistogram is to be imported and then run the observe method on it which takes an object with method: req.method, route: req.route.path, status_code: res.statusCode. 
1. After this object, the observe method also takes a , time / 1000 to show the time in seconds.
1. After this is done with every request to the server, the metrics endpoint can be accessed to get the response times, method, path, and statusCode etc.

### Changes to product.service.ts
___

1. These changes is for the database part. It should ideally be for all functions that call the database but as a sample it is only implemented in the createProduct and findProduct functions in product.service.ts.
1. In the createProduct function, create a const metricsLabel and set it equal to an object which has a property called 'operation' which is set to 'Create Product'. If you recall, 'operation' is one of the labelNames from the dbResponseTimeHistogram.
1. Right before the try catch of the productModel.create bit, import dbResponseTimeHistogram and run the startTimer method on it.
1. Then in the try after awaiting the ProductModel.create, before the return do timer({...metricsLabel, success: 'true'}). So the time is recorded when we get a successful reponse from the database.
1. Then in the catch do timer({...metricsLabel, sucess: 'false'}) so the response time of the database is recorded when we get an unsuccessful response from the database.
### Testing
___
Create a product with a POST request, and then make a GET request to the metrics endpoint using the Thunder Client extension or Postman to ensure the code is working as expected.  

