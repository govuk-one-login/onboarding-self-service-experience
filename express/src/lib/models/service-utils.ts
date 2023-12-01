import {Service, ServiceFromDynamo} from "../../../@types/Service";

export function dynamoServiceToDomainService(service: ServiceFromDynamo): Service {
    return {id: service.pk.S.substring("service#".length), serviceName: service.service_name.S};
}

export function dynamoServicesToDomainServices(services: ServiceFromDynamo[]): Service[] {
    console.log("Services => " + services);
    return services.map(service => dynamoServiceToDomainService(service));
}
