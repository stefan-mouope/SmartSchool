package com.banksystem.bank_config_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@EnableConfigServer
@SpringBootApplication
public class BankConfigServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BankConfigServiceApplication.class, args);
	}

}
