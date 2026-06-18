import {Service, ServiceFromDynamo} from "../../../@types/Service";
import logger from "../logger";

export function dynamoServiceToDomainService(service: ServiceFromDynamo): Service {
    return {id: service.pk.S.substring("service#".length), serviceName: service.service_name.S};
}

export function dynamoServicesToDomainServices(services: ServiceFromDynamo[]): Service[] {
    logger.debug("Services => " + services);
    return services.map(service => dynamoServiceToDomainService(service));
}
