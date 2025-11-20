package com.banksystem.bank_registry_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@EnableEurekaServer
@SpringBootApplication
public class BankRegistryServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BankRegistryServiceApplication.class, args);
	}

}
