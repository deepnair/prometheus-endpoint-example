import cookieParser from "cookie-parser";
import express, { Request, Response } from "express"
import deserializeUser from "../middleware/deserializeUser"
import routes from "../routes"
import cors from "cors"
import config from "config"
import responseTime from "response-time"
import startMetricsServer, { restAPIResponseTimeHistogram } from "./metrics";

const createServer = () => {
    const app = express();

    app.use(cors({
        origin: config.get<string>("origin"),
        credentials: true
    }))

    app.use(cookieParser());

    app.use(express.json());    
    
    app.use(deserializeUser);

    app.use(
        responseTime((req: Request, res: Response, time: number) => {
            if(req?.route?.path){
                restAPIResponseTimeHistogram.observe({
                    method: req.method,
                    route: req.route.path,
                    status_code: res.statusCode
                }, time/1000)
            }
        })
    )

    routes(app);

    startMetricsServer(app);

    return app;
}

export default createServer;