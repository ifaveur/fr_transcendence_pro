import { LoggerService } from "src/logger/logger.service";


export enum status2FA 
{
    NotActivate = "NotActivate",
    ValidationPending = "ValidationPending",
    Activate = "Activate",   
}

export function logger(...args) {

    var log: LoggerService = new LoggerService();
    log.dbg(...args)
}

export const domain:string = process.env.DOMAIN;