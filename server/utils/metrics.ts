import express, { Request, Response, Express } from "express"
import log from "./logger"
import config from "config"
import client from "prom-client"


const port = config.get<number>("metricsPort")

export const restAPIResponseTimeHistogram = new client.Histogram({
    name: 'rest_api_response_time_seconds',
    help: 'Rest API response time in seconds',
    labelNames: ['method', 'route', 'status_code']
})

export const dbAPIResponseTimeHistogram = new client.Histogram({
    name: 'db_response_time_seconds',
    help: 'Database response time in seconds',
    labelNames: ['operation', 'success']
})


const startMetricsServer = (app: Express) => {
    const collectDefaultMetrics = client.collectDefaultMetrics

    collectDefaultMetrics()
    
    app.route("/metrics").get(async (req: Request, res: Response) => {
        res.set("Content-Type", client.register.contentType)

        return res.send(await client.register.metrics())
    })

    app.listen(port, () => {
        log.info(`Prometheus metrics server listening on port ${port}`)
    })
}

export default startMetricsServer

