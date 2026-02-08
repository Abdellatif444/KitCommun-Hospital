package com.hospital.audit.config;

import com.hospital.audit.contract.MedicalAudit;
import java.math.BigInteger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.gas.StaticGasProvider;

@Configuration
public class ApplicationConfig {

    @Value("${web3j.client-address}")
    private String clientAddress;

    @Value("${web3j.contract-address}")
    private String contractAddress;

    @Value("${web3j.wallet-private-key}")
    private String privateKey;

    @Bean
    public Web3j web3j() {
        return Web3j.build(new HttpService(clientAddress));
    }

    @Bean
    public MedicalAudit medicalAudit(Web3j web3j) {
        // Cles pour signer les transactions (logAction coute du gaz)
        Credentials credentials = Credentials.create(privateKey);
        
        // Gas Price et Limit fixes pour Ganache (simple)
        BigInteger gasPrice = BigInteger.valueOf(20_000_000_000L); // 20 Gwei
        BigInteger gasLimit = BigInteger.valueOf(6_721_975L); // Default Ganache limit

        return MedicalAudit.load(
            contractAddress, 
            web3j, 
            credentials, 
            new StaticGasProvider(gasPrice, gasLimit)
        );
    }
}
